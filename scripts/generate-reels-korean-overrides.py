#!/usr/bin/env python3
"""Generate Korean, content-first Reel cards with a local MLX instruct model.

Runtime-only dependency: ``mlx-lm``. Raw media and checkpoints remain under
``artifacts`` and are not deployment assets.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from mlx_lm import batch_generate, generate, load
from mlx_lm.sample_utils import make_sampler


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = "mlx-community/Qwen2.5-7B-Instruct-4bit"

SYSTEM_PROMPT = """당신은 한국어 트레이딩 영상 아카이브의 수석 편집자다.
제공된 제목·설명·전사에 실제로 있는 영상 내용만 사용한다. 수집, 스크롤,
목록 등록, 전사 작업 같은 제작 과정은 카드 내용에 절대 쓰지 않는다. 영문
문장을 인용하거나 직역하지 말고 트레이딩 문맥에 맞는 자연스러운 한국어로
핵심과 인사이트를 재서술한다. 영상에 없는 조건이나 성과는 만들지 않는다.
홍보 문구는 핵심과 규칙에서 제외한다. 짧은 음성이나 음악 영상도 게시 설명에
구체적인 시간대·가격대·행동이 있으면 그 내용을 반드시 요약한다. 실제 근거가
전혀 없는 경우에만 구체적 규칙이 없다고 쓴다. 비슷한 주제의 다른 영상과도
구별되도록 해당 영상만의 시간 프레임·기준 가격·행동을 제목에 반영한다.
중국어·일본어·영어 문장이나 손상 문자를 섞지 않는다. JSON 외에는 출력하지 않는다."""

TRADING_RE = re.compile(
    r"\b(trad(?:e|er|ing)|strategy|market|price|candle|high|low|open|close|entry|enter|buy|sell|long|short|"
    r"target|stop|risk|profit|loss|vwap|fvg|liquidity|sweep|order block|support|resistance|"
    r"range|break|retest|option|stock|futures|nasdaq|\bnq\b|\bes\b|chart|timeframe|session)\b",
    re.I,
)
ACTION_RE = re.compile(
    r"\b(mark|wait|enter|entry|buy|sell|long|short|target|stop|risk|size|look for|"
    r"identify|confirm|avoid|close|exit|set|draw|move|scale|take profit|hold|break|retest)\b",
    re.I,
)
SETUP_RE = re.compile(
    r"\b(entry|enter|buy|sell|long|short|candle|vwap|ema|sma|breakout|support|resistance|"
    r"liquidity|range|fibonacci|setup|strategy|stop loss|target|fvg|order block)\b",
    re.I,
)
PSYCH_RE = re.compile(
    r"\b(discipline|mindset|psychology|patience|emotion|journal|habit|consistent|confidence|"
    r"fear|greed|revenge|overtrad|sleep|burnout)\b",
    re.I,
)
RISK_RE = re.compile(r"\b(risk|stop loss|position size|drawdown|loss limit|account size)\b", re.I)
CLAIM_RE = re.compile(
    r"\$|%|\b(percent|win rate|profitable|profit|million|thousand|six figures?|income|payout|"
    r"return|made\s+\d|up\s+\d|earned|funded)\b",
    re.I,
)
CTA_RE = re.compile(
    r"\b(comment|follow|course|class|webinar|link in|dm me|join|free|ticket|workshop|"
    r"masterclass|discord|bio)\b",
    re.I,
)
PROCESS_RE = re.compile(
    r"스크롤|추가 확인|공개 릴스|고유 ID|연구 목록|원문 전사 기준|영상 발화 분석|"
    r"콘텐츠다|원문 실행 문장|additional-audit|목록화|전사 작업",
    re.I,
)
KOREAN_RE = re.compile(r"[가-힣]")
FOREIGN_TEXT_RE = re.compile(r"[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30ff\u0400-\u04ff\ufffd]")

TOPIC_RULES = [
    (r"9\s*:?30\s*(?:a\.?m\.?)?.{0,50}(?:high|low)|930\s*(?:high|low)", "오전 9시 30분 고저점", "개장 범위"),
    (r"anchored?\s+vwap", "앵커드 VWAP", "VWAP"),
    (r"\bvwap\b", "VWAP 기준선", "VWAP"),
    (r"candle range|\bcrt\b|four hour candle|4\s*(?:hour|hr)", "4시간봉 캔들 범위", "캔들 범위"),
    (r"fair value gap|\bfvg\b|\bifvg\b", "공정가치갭 되돌림", "FVG"),
    (r"liquidity|sweep|purge", "유동성 스윕", "유동성"),
    (r"order block", "오더블록 재시험", "오더블록"),
    (r"opening range|\borb\b", "개장 범위 돌파", "개장 범위"),
    (r"support|resistance", "지지·저항 반응", "지지·저항"),
    (r"moving average|\bema\b|\bsma\b", "이동평균 추세 판단", "이동평균"),
    (r"fibonacci|golden zone", "피보나치 되돌림", "피보나치"),
    (r"option|\bcall\b|\bput\b|\bdelta\b|\btheta\b", "옵션 포지션 운용", "옵션"),
    (r"stop loss|position size|drawdown|risk", "손실 한도와 위험관리", "위험관리"),
    (r"discipline|mindset|psychology|patience|emotion|revenge trad|journal|habit", "매매 심리와 규율", "심리·규율"),
    (r"stock|sector|\betf\b", "종목과 섹터 흐름", "주식·섹터"),
    (r"futures|nasdaq|\bnq\b|\bes\b|s&p", "지수선물 매매", "선물·지수"),
]


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def clean_description(value: object) -> str:
    text = clean(value)
    # 20-Minute Trader가 거의 모든 게시물 뒤에 붙인 동일 설문 문구는 실제
    # 영상 주제보다 강하게 반복되어 요약을 오염시키므로 분석 입력에서 제외한다.
    text = re.split(
        r"In a recent survey of 20-Minute Trader students|"
        r"In a recent survey of students across all products",
        text,
        maxsplit=1,
        flags=re.I,
    )[0]
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\b(?:comment|type)\s+[“\"']?(?:class|free|secret)[”\"']?.*?(?:[.!?]|$)", " ", text, flags=re.I)
    text = re.sub(r"\bwatch the full video here\s*:?", " ", text, flags=re.I)
    text = re.sub(r"(?:^|\s)#[\w-]+", " ", text)
    return clean(text)


def truncate(value: str, limit: int) -> str:
    value = clean(value)
    return value if len(value) <= limit else value[: limit - 1].rstrip() + "…"


def correct_asr(value: str) -> str:
    replacements = [
        (r"\b930\b", "9:30"),
        (r"kindle\s+clos(?:e|ure|ing)", "candle close"),
        (r"\btray\b", "trade"),
        (r"fair valley (?:gap|camp)|fair value camp|\bfeg\b", "FVG"),
        (r"sell sign liquidity|cell side liquidity", "sell-side liquidity"),
        (r"buy sign liquidity", "buy-side liquidity"),
    ]
    for pattern, replacement in replacements:
        value = re.sub(pattern, replacement, value, flags=re.I)
    return clean(value)


def split_chunks(text: str) -> list[str]:
    rough = re.split(r"(?<=[.!?])\s+|\n+", clean(text))
    chunks: list[str] = []
    for sentence in rough:
        words = sentence.split()
        while len(words) > 48:
            chunks.append(" ".join(words[:48]))
            words = words[48:]
        if len(words) >= 3:
            chunks.append(" ".join(words))
    return chunks


def context_score(sentence: str) -> float:
    score = min(len(sentence), 220) / 55
    score += 5 if ACTION_RE.search(sentence) else 0
    score += 4 if SETUP_RE.search(sentence) else 0
    score += 2 if re.search(r"\d|because|means|therefore|however", sentence, re.I) else 0
    score -= 5 if CTA_RE.search(sentence) else 0
    score -= 3 if re.fullmatch(r"(?:order filled|okay|all right|thank you)[.! ]*", sentence, re.I) else 0
    return score


def select_context(text: str, limit: int = 5200) -> str:
    text = correct_asr(text)
    if len(text) <= limit:
        return text
    chunks = split_chunks(text)
    indexes = {0, 1, len(chunks) - 2, len(chunks) - 1}
    indexes.update(round(i * (len(chunks) - 1) / 6) for i in range(7))
    indexes.update(sorted(range(len(chunks)), key=lambda index: -context_score(chunks[index]))[:14])
    selected = [chunks[index] for index in sorted(indexes) if 0 <= index < len(chunks)]
    while len(" ".join(selected)) > limit and len(selected) > 8:
        selected.pop(-2)
    return " ".join(selected)


def source_candidates(artifact_root: Path, source: str) -> list[dict]:
    grouped: dict[str, list[Path]] = {}
    for info_path in artifact_root.rglob("*.info.json"):
        if info_path.parent.name == source:
            grouped.setdefault(info_path.name.removesuffix(".info.json"), []).append(info_path)

    def score(info_path: Path) -> tuple[int, float]:
        reel_id = info_path.name.removesuffix(".info.json")
        directory = info_path.parent
        value = 30 if (directory / f"{reel_id}.txt").exists() else 0
        value += 20 if (directory / f"{reel_id}.transcript.txt").exists() else 0
        value += 10 if (directory / f"{reel_id}.caption.txt").exists() else 0
        value += 1 if (directory / f"{reel_id}.sheet.jpg").exists() else 0
        return value, info_path.stat().st_mtime

    records = []
    for reel_id, paths in sorted(grouped.items()):
        info_path = max(paths, key=score)
        directory = info_path.parent
        transcript_options = [
            (directory / f"{reel_id}.txt", "Whisper large-v3-turbo"),
            (directory / f"{reel_id}.transcript.txt", "Facebook 자동 자막"),
            (directory / f"{reel_id}.caption.txt", "Facebook 게시문 캡션(무음 영상)"),
        ]
        transcript_path, transcript_source = next(
            ((path, source_name) for path, source_name in transcript_options if path.exists()),
            (None, None),
        )
        if not transcript_path:
            continue
        info = json.loads(info_path.read_text())
        transcript = correct_asr(transcript_path.read_text(errors="replace"))
        description = correct_asr(clean_description(info.get("description") or ""))
        # 게시 설명에는 음성에 없는 시간대·가격 기준·화면 문구가 들어가는 경우가
        # 많다. 음악이나 반복 음성이 길다는 이유로 설명을 버리면 실제 조건이 있는
        # 릴스를 빈 영상으로 오판하므로 항상 전사와 함께 판단 근거에 포함한다.
        full_text = f"{transcript}. {description}" if description else transcript
        records.append({
            "id": reel_id,
            "info": info,
            "text": full_text,
            "context": select_context(full_text),
            "source": transcript_source,
            "word_count": len(transcript.split()),
            "has_sheet": (directory / f"{reel_id}.sheet.jpg").exists(),
        })
    return records


def clean_original_title(info: dict) -> str:
    title = clean(info.get("title"))
    uploader = clean(info.get("uploader")).lower()
    parts = [part.strip() for part in title.split("|")]
    candidates = [
        part for part in parts
        if part and not re.search(r"\b(?:views?|reactions?|likes?|comments?)\b", part, re.I)
        and part.lower() != uploader
    ]
    description = clean(info.get("description"))
    return truncate((candidates or [description or title])[0], 180)


def format_date(value: object) -> str | None:
    digits = re.sub(r"\D", "", str(value or ""))
    return f"{digits[:4]}.{digits[4:6]}.{digits[6:8]}" if len(digits) == 8 else None


def format_duration(value: object) -> str:
    total = max(0, round(float(value or 0)))
    hours, remainder = divmod(total, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}" if hours else f"{minutes:02d}:{seconds:02d}"


def make_prompt(record: dict) -> str:
    info = record["info"]
    return f"""[원본 제목]
{clean_original_title(info)}
[게시 설명]
{truncate(clean_description(info.get('description')), 500) or '없음'}
[영상 전사]
{record['context']}

아래 스키마의 짧고 유효한 JSON 객체만 작성하라.
{{
  "title": "다른 영상과 구별되는 시간 프레임·기준 가격·행동을 담은 한글 제목",
  "core": "영상이 말하는 핵심 원리와 인사이트를 1~2개의 완결된 한글 문장으로 요약",
  "rules": ["영상에서 실제 제시한 조건·행동을 완결된 한글 문장으로 작성", "다음 조건·행동"],
  "tags": ["한글 중심 태그", "필요한 표준 약어"]
}}
rules는 1~3개의 JSON 문자열 배열이다. 셋업이면 진입 순서를 보존한다. 제목이나
게시 설명에 실제 조건이 있으면 음성이 짧아도 그 조건을 rules에 반영한다. 구체적인
매매 설명이 정말 없는 밈·음악·홍보 영상만 rules에 "구체적인 매매 규칙은 제시되지
않는다."라고 쓴다. 입력에 실제로 등장한 시간·수치·위험보상비만 사용하고, 입력에 없는
9:30 같은 시각이나 조건을 추가하지 않는다. 모든 문장을 자연스러운 한국어 종결형으로
쓰고 영어 원문을 복사하지 않는다."""


def parse_json(value: str) -> dict | None:
    value = re.sub(r"^```(?:json)?\s*|\s*```$", "", value.strip(), flags=re.I)
    # 일부 로컬 모델 출력은 JSON 문자열을 보기 좋게 줄바꿈하면서 행 끝에
    # 역슬래시를 넣는다. 의미는 공백 하나이므로 파싱 전에 안전하게 합친다.
    value = re.sub(r"\\\s*\n\s*", " ", value)
    start, end = value.find("{"), value.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        parsed = json.loads(value[start : end + 1])
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def unsupported_conditions(card: dict | None, evidence: str) -> list[str]:
    """Return model-added numeric conditions that are absent from the source."""
    if not card:
        return []
    # 날짜와 영상 길이(예: 00:12)는 분석 내용이 아니며, 이를 위험보상비
    # 1:2로 오인하지 않도록 의미 필드만 검사한다.
    rendered = " ".join(clean(card.get(key)) for key in ("title", "core"))
    rendered += " " + " ".join(clean(item) for item in card.get("rules", []) if item)
    rendered += " " + " ".join(clean(item) for item in card.get("tags", []) if item)
    unsupported = []
    mentions_930 = re.search(r"9\s*[:시]?\s*30|오전\s*9시|\b930\b", rendered, re.I)
    evidence_930 = re.search(r"9\s*[.:]?\s*30|\b930\b|nine\s+thirty", evidence, re.I)
    if mentions_930 and not evidence_930:
        unsupported.append("9:30")
    mentions_one_to_two = re.search(
        r"1\s*[:대]\s*2|1\s*[-~]\s*2\s*(?:위험|risk)", rendered, re.I
    )
    evidence_one_to_two = re.search(
        r"1\s*[:/]\s*2|1\s+to\s+2|one\s+to\s+two|risk.?reward.{0,12}2",
        evidence,
        re.I,
    )
    if mentions_one_to_two and not evidence_one_to_two:
        unsupported.append("1:2")
    return unsupported


def normalize_korean(value: object) -> str:
    text = clean(value).strip("“”\"")
    replacements = [
        (r"(?<!:)\b930\b", "오전 9시 30분"),
        (r"(?<!오전 )9시\s*30분", "오전 9시 30분"),
        (r"Kindle Closure|킨들 클로저|킨들 종가", "캔들 종가 마감"),
        (r"캔들 클로징", "캔들 종가 마감"),
        (r"시장 폭격|930 시장 폭격|9:30 시장 폭격", "유동성 스윕"),
        (r"9:30 스위프트|오전 9시 30분 스위프트", "오전 9시 30분 유동성 스윕"),
        (r"목표(?:가| 가격)?(?:를)?\s*1\s*[~-]\s*2(?:\s*포인트)?", "1:2 위험보상비를 목표"),
        (r"1\s*대\s*2", "1:2"),
        (r"공정 가치 격차|공정가치 격차|공정값 격차|차익갭|\bFIG\b", "공정가치갭"),
        (r"비즈니스 빈익빈", "약세 공정가치갭"),
        (r"스탑\s*LOSS|스탑로스", "손절"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text, flags=re.I)
    return clean(text)


def topic_data(text: str) -> tuple[str, list[str]]:
    matches = [(topic, tag) for pattern, topic, tag in TOPIC_RULES if re.search(pattern, text, re.I)]
    return (matches[0][0], list(dict.fromkeys(tag for _, tag in matches))[:4]) if matches else ("시장 분석", ["시장 분석"])


def deterministic_title(text: str, model_title: str, kind: str) -> str:
    title = normalize_korean(model_title)
    if KOREAN_RE.search(title) and not FOREIGN_TEXT_RE.search(title) and not PROCESS_RE.search(title) and 8 <= len(title) <= 70:
        return title
    if re.search(r"9\s*:?30.{0,50}(?:high|low)", text, re.I):
        return "오전 9시 30분 고저점 돌파와 되돌림"
    if re.search(r"candle range|\bcrt\b|four hour candle|4\s*(?:hour|hr)", text, re.I):
        return "4시간봉 범위 스윕 뒤 반전 진입"
    if re.search(r"opening range|\borb\b", text, re.I):
        return "개장 범위 돌파와 재시험 진입"
    if re.search(r"anchored?\s+vwap", text, re.I):
        return "앵커드 VWAP 되돌림 활용법"
    if re.search(r"fair value gap|\bfvg\b|\bifvg\b", text, re.I):
        return "공정가치갭 되돌림을 이용한 진입"
    if re.search(r"liquidity|sweep|purge", text, re.I):
        return "유동성 스윕 뒤 반전 확인"
    if re.search(r"order filled", text, re.I) and re.search(r"partial|scale|target|exit|take one", text, re.I):
        return "실전 거래의 진입과 분할 청산 복기"
    if kind == "psychology":
        return "감정 개입을 줄이고 매매 규칙을 지키는 법"
    topic, _ = topic_data(text)
    return f"{topic}에 관한 트레이딩 관점"


def build_caution(text: str) -> str:
    missing = []
    if not re.search(r"stop loss|stop-loss|initial stop|hard stop|invalidation|swing (?:high|low)", text, re.I):
        missing.append("손절 기준")
    if not re.search(r"target|take profit|profit target|exit|risk.?reward|\brr\b", text, re.I):
        missing.append("청산 기준")
    if not re.search(r"position size|risk per|account risk|contract size", text, re.I):
        missing.append("포지션 크기")
    if not re.search(r"commission|fee|slippage|spread", text, re.I):
        missing.append("거래비용")
    cautions = []
    if CLAIM_RE.search(text):
        cautions.append("수익·승률·계좌 성과는 전체 거래 내역과 비용 반영 결과가 없는 제작자의 주장이다.")
    if CTA_RE.search(text):
        cautions.append("교육 상품·커뮤니티·팔로우 유도가 포함되어 있어 정보와 홍보를 분리해야 한다.")
    if missing:
        cautions.append(f"{'·'.join(missing)}이 완결된 규칙으로 제시되지 않았다.")
    if not cautions:
        cautions.append("단일 영상 사례이므로 다른 시장·세션과 실패 거래를 포함한 별도 검증이 필요하다.")
    return " ".join(cautions)


def fallback_card(record: dict) -> dict:
    _, tags = topic_data(record["text"])
    return {
        "title": "트레이딩 화면을 활용한 짧은 장면",
        "core": "트레이딩 화면과 음악 또는 짧은 반응을 결합한 영상으로, 구체적인 시장 분석이나 매매 조건은 설명하지 않는다.",
        "rules": ["구체적인 진입·손절·청산 규칙은 제시되지 않는다."],
        "tags": tags + ["짧은 장면"],
    }


def finalize(record: dict, raw_card: dict | None) -> dict:
    text = record["text"]
    # 트레이딩 키워드가 없는 스킷·동기부여·화면 메시지도 실제 영상 내용이다.
    # 모델 분석이 유효하면 주제 분류와 무관하게 사용하고, 생성 자체가 실패한
    # 경우에만 증거가 제한된 짧은 장면 fallback을 사용한다.
    card = raw_card or fallback_card(record)
    has_setup = bool(SETUP_RE.search(text) and ACTION_RE.search(text))
    kind = "setup" if has_setup else "psychology" if PSYCH_RE.search(text) else "risk" if RISK_RE.search(text) or CLAIM_RE.search(text) else "commentary"
    has_stop = bool(re.search(r"stop loss|stop-loss|initial stop|hard stop|invalidation|swing (?:high|low)", text, re.I))
    has_target = bool(re.search(r"target|take profit|profit target|exit|risk.?reward|\brr\b", text, re.I))
    verdict = "규칙화 가능" if kind == "setup" and has_stop and has_target else "검증 필요" if kind == "setup" else "핵심 원칙" if kind in {"risk", "psychology"} else "전략 아님"

    core = normalize_korean(card.get("core"))
    if not KOREAN_RE.search(core) or FOREIGN_TEXT_RE.search(core) or PROCESS_RE.search(core) or len(core) < 24:
        core = fallback_card(record)["core"]
    core = truncate(core, 420)
    raw_rules = card.get("rules")
    if isinstance(raw_rules, str):
        raw_rules = re.split(r"\n+|\s*\d+[.)]\s*", raw_rules)
    rules = []
    for item in raw_rules if isinstance(raw_rules, list) else []:
        item = normalize_korean(item)
        if item and KOREAN_RE.search(item) and not FOREIGN_TEXT_RE.search(item) and not PROCESS_RE.search(item) and not CTA_RE.search(item):
            rules.append(truncate(item, 220))
    if not rules:
        rules = fallback_card(record)["rules"]

    _, detected_tags = topic_data(text)
    raw_tags = card.get("tags") if isinstance(card.get("tags"), list) else []
    tags = []
    for tag in detected_tags + [normalize_korean(tag) for tag in raw_tags]:
        if tag and not FOREIGN_TEXT_RE.search(tag) and not PROCESS_RE.search(tag) and tag not in tags:
            tags.append(truncate(tag, 28))

    info = record["info"]
    fidelity = ["원본 영상", record["source"], "대표 화면 직접 확인" if record["has_sheet"] else "영상 메타데이터 확인"]
    return {
        "date": format_date(info.get("upload_date")),
        "duration": format_duration(info.get("duration")),
        "originalTitle": clean_original_title(info),
        "title": deterministic_title(text, card.get("title", ""), kind),
        "kind": kind,
        "verdict": verdict,
        "fidelity": "·".join(fidelity),
        "tags": tags[:4],
        "core": core,
        "rules": rules[:3],
        "caution": build_caution(text),
        "transcriptVerified": True,
        "transcriptWordCount": record["word_count"],
        "transcriptSource": record["source"],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--artifact", required=True, type=Path)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--fresh", action="store_true")
    parser.add_argument("--retry-generic", action="store_true")
    parser.add_argument("--retry-unsupported", action="store_true")
    parser.add_argument("--strict-retry", action="store_true")
    parser.add_argument("--id", action="append", dest="ids")
    parser.add_argument("--retry-pattern")
    args = parser.parse_args()

    artifact_root = args.artifact.resolve()
    records = source_candidates(artifact_root, args.source)
    if args.ids:
        selected_ids = {str(reel_id) for reel_id in args.ids}
        records = [record for record in records if record["id"] in selected_ids]
    if not records:
        raise SystemExit(f"No transcript-ready records: {artifact_root} ({args.source})")

    checkpoint_dir = artifact_root / "korean-card-checkpoints"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_path = checkpoint_dir / f"{args.source}.json"
    generated = {} if args.fresh or not checkpoint_path.exists() else json.loads(checkpoint_path.read_text())
    generic_ids = {
        reel_id for reel_id, card in generated.items()
        if "트레이딩 화면과 음악 또는 짧은 반응" in card.get("core", "")
        or card.get("title") == "트레이딩 화면을 활용한 짧은 장면"
        or card.get("title", "").endswith("에 관한 트레이딩 관점")
    }
    pattern_ids = {
        reel_id for reel_id, card in generated.items()
        if args.retry_pattern and re.search(args.retry_pattern, json.dumps(card, ensure_ascii=False), re.I)
    }
    evidence_by_id = {record["id"]: record["text"] for record in records}
    unsupported_ids = {
        reel_id for reel_id, card in generated.items()
        if reel_id in evidence_by_id and unsupported_conditions(card, evidence_by_id[reel_id])
    }
    pending = [
        record for record in records
        if record["id"] not in generated
        or (args.retry_generic and record["id"] in generic_ids)
        or (args.retry_unsupported and record["id"] in unsupported_ids)
        or record["id"] in pattern_ids
    ]
    model = tokenizer = None
    sampler = make_sampler(temp=0.0)

    for start in range(0, len(pending), args.batch_size):
        batch = pending[start : start + args.batch_size]
        model_batch = batch if args.strict_retry else [
            record for record in batch
            if TRADING_RE.search(record["text"]) and len(record["text"].split()) >= 5
        ]
        responses: dict[str, dict | None] = {}
        if model_batch:
            if model is None:
                model, tokenizer = load(args.model)
            prompts = [
                tokenizer.apply_chat_template(
                    [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": make_prompt(record)}],
                    tokenize=False,
                    add_generation_prompt=True,
                )
                for record in model_batch
            ]
            if args.strict_retry:
                response_texts = [
                    generate(model, tokenizer, prompt, max_tokens=340, sampler=sampler, verbose=False)
                    for prompt in prompts
                ]
            else:
                result = batch_generate(
                    model,
                    tokenizer,
                    [tokenizer.encode(prompt) for prompt in prompts],
                    max_tokens=260,
                    sampler=sampler,
                    verbose=False,
                )
                response_texts = result.texts
            for record, response in zip(model_batch, response_texts):
                parsed = parse_json(response)
                rejected = unsupported_conditions(parsed, record["text"])
                # 대량 재생성은 먼저 배치 처리하고, 남은 근거 불일치만
                # --strict-retry의 단건 교정 단계에서 다시 생성한다.
                if parsed is None or (rejected and args.strict_retry):
                    correction = (
                        "이전 출력이 JSON 형식에 실패했다. JSON만 다시 작성하라."
                        if parsed is None else
                        f"이전 출력에 원문에 없는 {', '.join(rejected)} 조건이 추가됐다. "
                        "그 조건을 완전히 제거하고 원문에 실제 있는 내용만으로 JSON을 다시 작성하라."
                    )
                    retry_chat = tokenizer.apply_chat_template(
                        [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": make_prompt(record) + "\n" + correction}],
                        tokenize=False,
                        add_generation_prompt=True,
                    )
                    parsed = parse_json(generate(model, tokenizer, retry_chat, max_tokens=340, sampler=sampler, verbose=False))
                responses[record["id"]] = parsed
        for record in batch:
            generated[record["id"]] = finalize(record, responses.get(record["id"]))
        checkpoint_path.write_text(json.dumps(generated, ensure_ascii=False, indent=2))
        print(f"generated {len(generated)}/{len(records)}", flush=True)

    export_name = re.sub(r"-([a-z0-9])", lambda match: match.group(1).upper(), args.source)
    export_name = export_name[0].upper() + export_name[1:] + "TranscriptOverrides"
    output_path = ROOT / "src/data/reels-transcripts" / f"{args.source}.js"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "// 자동 생성 파일: 전사와 대표 화면에서 추출한 한국어 콘텐츠 요약\n"
        f"export const {export_name} = new Map(Object.entries({json.dumps(generated, ensure_ascii=False, indent=2)}));\n"
    )
    process_count = sum(PROCESS_RE.search(" ".join([item["title"], item["core"], *item["rules"]])) is not None for item in generated.values())
    print(json.dumps({"source": args.source, "generated": len(generated), "processText": process_count, "output": str(output_path)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
