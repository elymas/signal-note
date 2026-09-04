import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { dumbHunterResearch } from '../src/data/reels-pages/dumb-hunter.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactRoot = path.join(rootDir, 'artifacts');
const outputPath = path.join(rootDir, 'src/data/reels-transcripts/dumb-hunter-recovered-evidence.js');

const infoPathsById = new Map();
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
      continue;
    }
    if (entry.name.endsWith('.info.json') && path.basename(path.dirname(filePath)) === 'dumb-hunter') {
      const id = entry.name.slice(0, -'.info.json'.length);
      const paths = infoPathsById.get(id) ?? [];
      paths.push(filePath);
      infoPathsById.set(id, paths);
    }
  }
};
walk(artifactRoot);

const wordCount = (value) => String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
const findEvidence = (id) => {
  const candidates = infoPathsById.get(id) ?? [];
  const score = (infoPath) => {
    const directory = path.dirname(infoPath);
    return 100 * Number(fs.existsSync(path.join(directory, `${id}.sheet.jpg`)))
      + 50 * Number(fs.existsSync(path.join(directory, `${id}.visual.txt`)))
      + 30 * Number(fs.existsSync(path.join(directory, `${id}.txt`)))
      + 20 * Number(fs.existsSync(path.join(directory, `${id}.transcript.txt`)))
      + 10 * Number(fs.existsSync(path.join(directory, `${id}.caption.txt`)));
  };
  const infoPath = candidates.sort((left, right) => score(right) - score(left))[0];
  if (!infoPath) throw new Error(`Missing info.json for ${id}`);
  const directory = path.dirname(infoPath);
  const transcriptOptions = [
    [`${id}.txt`, 'Whisper large-v3-turbo'],
    [`${id}.transcript.txt`, 'Facebook 자동자막'],
    [`${id}.caption.txt`, 'Facebook 게시문 캡션(음성 없음)'],
  ];
  const selected = transcriptOptions
    .map(([name, source]) => ({ path: path.join(directory, name), source }))
    .find(({ path: candidatePath }) => fs.existsSync(candidatePath));
  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  const description = String(info.description ?? '').trim();
  const transcript = selected ? fs.readFileSync(selected.path, 'utf8').trim() : '';
  const visualPath = path.join(directory, `${id}.visual.txt`);
  const sheetPath = path.join(directory, `${id}.sheet.jpg`);
  if (!fs.existsSync(sheetPath) || !fs.existsSync(visualPath)) {
    throw new Error(`Missing sheet/OCR evidence for ${id}`);
  }
  return { info, transcript, description, source: selected?.source ?? null };
};

const getCta = (evidence) => {
  const text = evidence.toLowerCase();
  const actions = [];
  if (/\bcomment\b|댓글/.test(text)) actions.push('댓글 참여');
  if (/\bdiscord\b|커뮤니티/.test(text)) actions.push('Discord·커뮤니티 참여');
  if (/\byoutube\b|유튜브/.test(text)) actions.push('YouTube 추가 영상 시청');
  if (/\b(?:course|class|education|training|mentor)\b|강의|교육/.test(text)) actions.push('교육 콘텐츠 확인');
  if (/\b(?:maven|prop firm|funded account|discount|promo|coupon|code\s+[a-z0-9]+)\b|할인|프롭/.test(text)) actions.push('프롭 상품·프로모션 확인');
  if (/\b(?:follow|subscribe|like|share)\b|팔로우|구독|좋아요/.test(text)) actions.push('팔로우·구독');
  const unique = [...new Set(actions)];
  return unique.length
    ? `다음 행동을 유도한다: ${unique.join('·')}.`
    : '명시적인 참여·구매 유도는 확인되지 않는다.';
};

const overrides = {};
const sourceCounts = {};
let transcriptWords = 0;
let noAudioCount = 0;
for (const reel of dumbHunterResearch.recoveredReels) {
  const id = String(reel.id);
  const { info, transcript, description, source } = findEvidence(id);
  const count = wordCount(transcript);
  const evidenceText = [info.title, description, transcript, reel.fidelity, reel.core, ...(reel.rules ?? [])].join(' ');
  if (source && count > 0) {
    overrides[id] = {
      transcriptVerified: true,
      transcriptWordCount: count,
      transcriptSource: source,
      evidenceLabel: `${source}·대표 화면 OCR·콘택트시트 확인`,
      evidencePath: 'transcript-and-frames',
      cta: getCta(evidenceText),
    };
    sourceCounts[source] = (sourceCounts[source] ?? 0) + 1;
    transcriptWords += count;
  } else {
    noAudioCount += 1;
    const fallbackSource = description
      ? 'Facebook 게시문 캡션·대표 화면(음성 없음)'
      : '원본 영상·대표 화면(음성 없음)';
    overrides[id] = {
      transcriptVerified: false,
      transcriptWordCount: 0,
      transcriptSource: fallbackSource,
      evidenceLabel: `${fallbackSource}·OCR·콘택트시트 확인`,
      evidencePath: 'caption-and-frames-no-audio',
      cta: getCta(evidenceText),
    };
    sourceCounts[fallbackSource] = (sourceCounts[fallbackSource] ?? 0) + 1;
  }
}

fs.writeFileSync(
  outputPath,
  `// Dumb Hunter 복구 카드의 전사·프레임 증거 메타데이터.\n`
    + `export const DumbHunterRecoveredEvidence = new Map(Object.entries(${JSON.stringify(overrides, null, 2)}));\n`,
);
console.log(JSON.stringify({
  outputPath,
  cards: Object.keys(overrides).length,
  transcriptWords,
  sourceCounts,
  noAudioCount,
}, null, 2));
