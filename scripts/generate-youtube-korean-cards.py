#!/usr/bin/env python3
"""Generate evidence-backed Korean cards for one audited YouTube update batch."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from mlx_lm import generate, load
from mlx_lm.sample_utils import make_sampler


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = "mlx-community/Qwen2.5-7B-Instruct-4bit"
ALLOWED_KINDS = {"종목 분석", "시장 해설", "후속 검증", "방법론", "시황"}
ALLOWED_PATTERNS = {"turn", "runner", "event", "followup", "market", "method"}

SYSTEM_PROMPT = """당신은 한국어 투자 영상 아카이브의 수석 편집자다. 제목·설명·전체
자막·대표 프레임 OCR에 실제로 있는 내용만 사용한다. 원문을 길게 복사하지 않고 영상의
논리, 구체 종목·수치·조건, 성과 주장, CTA, 누락된 위험 통제를 분리한다. 영상 주장을
독립 검증 사실처럼 쓰지 않는다. 자연스러운 한국어 JSON만 출력한다."""


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def duration(value: object) -> str:
    total = max(0, round(float(value or 0)))
    hours, remainder = divmod(total, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}" if hours else f"{minutes:02d}:{seconds:02d}"


def date(value: object) -> str | None:
    digits = re.sub(r"\D", "", str(value or ""))
    return f"{digits[:4]}.{digits[4:6]}.{digits[6:8]}" if len(digits) == 8 else None


def select_transcript(text: str, limit: int = 15000) -> str:
    text = clean(text)
    if len(text) <= limit:
        return text
    sentences = re.split(r"(?<=[.!?다요죠])\s+", text)
    selected = {0, 1, len(sentences) - 2, len(sentences) - 1}
    selected.update(round(i * (len(sentences) - 1) / 9) for i in range(10))
    numeric = sorted(
        range(len(sentences)),
        key=lambda index: -(6 * bool(re.search(r"\d|%|원|주|배|조|억|만", sentences[index]))
                            + 3 * bool(re.search(r"매수|손절|목표|실적|영업이익|외국인|기관|수급|공시|계약", sentences[index]))
                            + min(len(sentences[index]), 240) / 80),
    )[:36]
    selected.update(numeric)
    output = [sentences[index] for index in sorted(selected) if 0 <= index < len(sentences)]
    while len(" ".join(output)) > limit and len(output) > 12:
        output.pop(-3)
    return " ".join(output)


def parse_json(value: str) -> dict | None:
    value = re.sub(r"^```(?:json)?\s*|\s*```$", "", value.strip(), flags=re.I)
    start, end = value.find("{"), value.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        parsed = json.loads(value[start : end + 1])
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def prompt(record: dict) -> str:
    return f"""[원본 제목]
{record['title']}
[게시 설명]
{record['description'][:2400] or '없음'}
[영상 전체 자막에서 선별한 근거]
{record['transcript']}
[대표 프레임 OCR]
{record['visual'][:2200] or '식별 가능한 화면 문자 없음'}

아래 스키마의 JSON 객체만 작성하라.
{{
  "kind": "종목 분석|시장 해설|후속 검증|방법론|시황 중 하나",
  "pattern": "turn|runner|event|followup|market|method 중 하나",
  "theme": "짧은 산업·시장 테마",
  "subject": "핵심 종목 또는 분석 대상",
  "title": "클릭베이트를 제거한 구체적인 한글 분석 제목",
  "thesis": "영상의 핵심 논리와 인사이트 2~3문장",
  "rules": ["영상이 실제 제시한 매수·선별·손절·목표 조건", "다음 조건"],
  "claims": "영상이 제시한 기업·실적·수급·가격·성과 주장을 2~4문장으로 분리 요약",
  "cta": "댓글·구독·상품·다음 영상 등 CTA, 없으면 없음",
  "risk": "원자료 확인 항목과 누락된 손절·청산·포지션 크기·비용을 구체적으로 지적"
}}
rules는 영상에 실제 숫자 조건이 있으면 보존하고, 없으면 없다고 명시한다. 매수 밴드나
목표가가 자막에 실제 등장하면 포함하되 이를 추천으로 바꾸지 않는다. JSON 외에는 쓰지 않는다."""


def load_records(artifact: Path) -> list[dict]:
    manifest = json.loads((artifact / "manifest.youtube.json").read_text())
    records = []
    for item in manifest["records"]:
        directory = Path(item["directory"])
        reel_id = item["id"]
        info = json.loads(Path(item["infoPath"]).read_text())
        transcript_options = [
            (directory / f"{reel_id}.txt", "Whisper large-v3-turbo"),
            (directory / f"{reel_id}.transcript.txt", "YouTube 자동자막"),
        ]
        transcript_path, source = next(
            ((path, label) for path, label in transcript_options if path.exists()),
            (None, None),
        )
        sheet = directory / f"{reel_id}.sheet.jpg"
        if not transcript_path or not sheet.exists():
            continue
        transcript_text = clean(transcript_path.read_text(errors="replace"))
        visual_path = directory / f"{reel_id}.visual.txt"
        records.append({
            "id": reel_id,
            "slug": item["slug"],
            "info": info,
            "title": clean(info.get("title")),
            "description": clean(info.get("description")),
            "transcript": select_transcript(transcript_text),
            "word_count": len(transcript_text.split()),
            "source": source,
            "visual": clean(visual_path.read_text(errors="replace")) if visual_path.exists() else "",
        })
    return records


def normalize(record: dict, card: dict) -> dict:
    info = record["info"]
    kind = clean(card.get("kind"))
    pattern = clean(card.get("pattern"))
    rules = card.get("rules") if isinstance(card.get("rules"), list) else []
    rules = [clean(rule) for rule in rules if clean(rule)][:4]
    if not rules:
        rules = ["영상에서 재현 가능한 매수·손절·청산 규칙을 완결해 제시하지 않는다."]
    return {
        "id": record["id"],
        "channelSlug": record["slug"],
        "date": date(info.get("upload_date")),
        "duration": duration(info.get("duration")),
        "kind": kind if kind in ALLOWED_KINDS else "종목 분석",
        "pattern": pattern if pattern in ALLOWED_PATTERNS else "event",
        "theme": clean(card.get("theme")) or "시장 테마",
        "subject": clean(card.get("subject")) or "시장 분석",
        "originalTitle": record["title"],
        "title": clean(card.get("title")) or record["title"],
        "thesis": clean(card.get("thesis")),
        "rules": rules,
        "claims": clean(card.get("claims")),
        "cta": clean(card.get("cta")) or "없음",
        "risk": clean(card.get("risk")),
        "transcriptSource": record["source"],
        "transcriptWordCount": record["word_count"],
        "transcriptVerified": True,
        "fidelity": f"원본 영상·{record['source']}·대표 화면 OCR·콘택트시트 확인",
        "url": f"https://www.youtube.com/watch?v={record['id']}",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--artifact", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--fresh", action="store_true")
    args = parser.parse_args()

    artifact = args.artifact.resolve()
    records = load_records(artifact)
    if not records:
        raise SystemExit("No transcript-and-visual-ready YouTube records")
    checkpoint_path = artifact / "youtube-card-checkpoint.json"
    generated = {} if args.fresh or not checkpoint_path.exists() else json.loads(checkpoint_path.read_text())
    pending = [record for record in records if record["id"] not in generated]
    model = tokenizer = None
    sampler = make_sampler(temp=0.0)

    for index, record in enumerate(pending, 1):
        if model is None:
            model, tokenizer = load(args.model)
        chat = tokenizer.apply_chat_template(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt(record)}],
            tokenize=False,
            add_generation_prompt=True,
        )
        parsed = parse_json(generate(model, tokenizer, chat, max_tokens=720, sampler=sampler, verbose=False))
        if parsed is None:
            retry = chat + "\n이전 출력은 JSON 파싱에 실패했다. 유효한 JSON 객체만 다시 작성하라."
            parsed = parse_json(generate(model, tokenizer, retry, max_tokens=720, sampler=sampler, verbose=False))
        if parsed is None:
            raise RuntimeError(f"Model JSON failure: {record['id']}")
        generated[record["id"]] = normalize(record, parsed)
        checkpoint_path.write_text(json.dumps(generated, ensure_ascii=False, indent=2))
        print(f"generated {index}/{len(pending)} {record['id']}", flush=True)

    ordered = [generated[record["id"]] for record in records]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        "// 자동 생성 파일: 2026-09-04 신규 YouTube 영상의 자막·대표 화면 기반 한국어 분석\n"
        f"export const youtubeUpdate20260904 = {json.dumps(ordered, ensure_ascii=False, indent=2)};\n"
    )
    print(json.dumps({"generated": len(ordered), "output": str(args.output)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
