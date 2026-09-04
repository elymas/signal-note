import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { reelsSources } from '../src/data/reels-sources.js';
import { dumbHunterResearch } from '../src/data/reels-pages/dumb-hunter.js';
import { DumbHunterRecoveredEvidence } from '../src/data/reels-transcripts/dumb-hunter-recovered-evidence.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactRoot = path.join(rootDir, 'artifacts');
const inventory = JSON.parse(fs.readFileSync(path.join(rootDir, 'research/reels-inventory/facebook-login-2026-09-04.json'), 'utf8'));
const checkpoint = JSON.parse(fs.readFileSync(path.join(rootDir, 'research/reels-analysis/checkpoint.json'), 'utf8'));
const sourceInventory = inventory.sources.find(({ slug }) => slug === 'dumb-hunter');
const targetIds = new Set(dumbHunterResearch.recoveredReels.map(({ id }) => String(id)));
const deferredIds = new Set(checkpoint.deferred.filter(({ slug }) => slug === 'dumb-hunter').map(({ id }) => String(id)));
const source = reelsSources.find(({ slug }) => slug === 'dumb-hunter');
const research = await source.load();
const renderedIds = research.reels.map(({ id }) => String(id));
const renderedById = new Map(research.reels.map((reel) => [String(reel.id), reel]));

const artifactPathsById = new Map();
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
      continue;
    }
    if (path.basename(path.dirname(filePath)) !== 'dumb-hunter') continue;
    const id = entry.name.match(/^(\d+)\./)?.[1];
    if (!id) continue;
    const paths = artifactPathsById.get(id) ?? new Set();
    paths.add(filePath);
    artifactPathsById.set(id, paths);
  }
};
walk(artifactRoot);

const koreanPattern = /[가-힣]/;
const foreignPattern = /[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30ff\u0400-\u04ff\ufffd]/;
const processPattern = /스크롤 끝|목록 등록|추가 확인된 공개|연구 목록|전사 작업|분석 대상으로 등록/;
const placeholderPattern = /트레이딩 화면을 활용한 짧은 장면|현재 자동 목록화 단계|원문 분석 전/;
const hasRawEnglish = (value) => {
  let run = 0;
  for (const token of String(value).split(/\s+/)) {
    run = /^[A-Za-z][A-Za-z'-]{2,}[.,!?;:]?$/.test(token) ? run + 1 : 0;
    if (run >= 8) return true;
  }
  return false;
};
const parseDuration = (value) => String(value ?? '').split(':').map(Number).reduce((total, part) => (total * 60) + part, 0);

const failures = [];
const rawReelCount = Object.values(dumbHunterResearch)
  .filter(Array.isArray)
  .flat()
  .filter((value) => value && typeof value === 'object' && value.id).length;
const methodologyReelCount = dumbHunterResearch.methodology.filter((value) => value && typeof value === 'object' && value.id).length;
if (rawReelCount !== dumbHunterResearch.reelCount || methodologyReelCount !== 0) {
  failures.push(`raw/declared/methodology mismatch ${rawReelCount}/${dumbHunterResearch.reelCount}/${methodologyReelCount}`);
}
if (targetIds.size !== 1256) failures.push(`expected 1256 recovered IDs, got ${targetIds.size}`);
if (DumbHunterRecoveredEvidence.size !== targetIds.size) failures.push(`evidence map mismatch ${DumbHunterRecoveredEvidence.size}/${targetIds.size}`);
if (renderedIds.length !== new Set(renderedIds).size) failures.push('duplicate rendered IDs');
if (source.notes !== 1800 || research.reelCount !== 1800 || renderedIds.length !== 1800) {
  failures.push(`registry/declared/rendered mismatch ${source.notes}/${research.reelCount}/${renderedIds.length}`);
}
const inventoryIds = new Set(sourceInventory.reelIds.map(String));
const pendingIds = [...inventoryIds].filter((id) => !renderedById.has(id) && !deferredIds.has(id));
if (sourceInventory.reelIds.length !== 1802 || deferredIds.size !== 2 || pendingIds.length !== 0) {
  failures.push(`inventory/rendered/deferred/pending mismatch ${sourceInventory.reelIds.length}/${renderedIds.length}/${deferredIds.size}/${pendingIds.length}`);
}

const sourceCounts = {};
let transcriptWords = 0;
let transcriptCards = 0;
let noAudioCards = 0;
let emptyOcrCards = 0;
for (const id of targetIds) {
  const reel = renderedById.get(id);
  if (!reel) {
    failures.push(`${id}: not rendered`);
    continue;
  }
  const visible = [reel.title, reel.core, ...(reel.rules ?? []), reel.cta, reel.caution].join(' ');
  if (!(reel.sourceUrl && reel.date && reel.duration && reel.title && reel.core && reel.rules?.length && reel.cta && reel.caution && reel.kind && reel.verdict && reel.tags?.length && reel.fidelity && reel.transcriptSource && reel.evidencePath)) {
    failures.push(`${id}: incomplete content/evidence fields`);
  }
  if (!koreanPattern.test(visible) || foreignPattern.test(visible) || processPattern.test(visible) || placeholderPattern.test(visible) || hasRawEnglish(visible)) {
    failures.push(`${id}: visible content quality failure`);
  }
  if (reel.evidencePath === 'transcript-and-frames') {
    transcriptCards += 1;
    if (reel.transcriptVerified !== true || !(reel.transcriptWordCount > 0)) failures.push(`${id}: transcript metadata missing`);
    transcriptWords += reel.transcriptWordCount;
    if (parseDuration(reel.duration) >= 300 && reel.transcriptWordCount / (parseDuration(reel.duration) / 60) < 40) {
      failures.push(`${id}: low-density long transcript`);
    }
  } else if (reel.evidencePath === 'caption-and-frames-no-audio') {
    noAudioCards += 1;
    if (reel.transcriptVerified !== false || reel.transcriptWordCount !== 0 || !/음성 없음/.test(reel.transcriptSource)) {
      failures.push(`${id}: no-audio fallback mislabeled`);
    }
  } else {
    failures.push(`${id}: unknown evidence path`);
  }
  sourceCounts[reel.transcriptSource] = (sourceCounts[reel.transcriptSource] ?? 0) + 1;

  const paths = artifactPathsById.get(id) ?? new Set();
  const names = new Set([...paths].map((filePath) => path.basename(filePath)));
  const has = (suffix) => [...names].some((name) => name === `${id}${suffix}`);
  if (!has('.info.json')) failures.push(`${id}: metadata artifact missing`);
  if (!has('.sheet.jpg') && !has('.sheet.png')) failures.push(`${id}: contact sheet missing`);
  if (!has('.visual.txt')) failures.push(`${id}: visual OCR artifact missing`);
  if (!has('.visual.mp4') && !has('.mp4') && ![...names].some((name) => name.startsWith(`${id}.visual.`) && !name.endsWith('.txt'))) failures.push(`${id}: visual media missing`);
  if (reel.evidencePath === 'transcript-and-frames' && !has('.txt') && !has('.transcript.txt') && !has('.caption.txt')) failures.push(`${id}: transcript artifact missing`);
  const visualTextPath = [...paths].find((filePath) => path.basename(filePath) === `${id}.visual.txt`);
  if (visualTextPath && !fs.readFileSync(visualTextPath, 'utf8').trim()) emptyOcrCards += 1;
}

console.log(JSON.stringify({
  target: targetIds.size,
  rawReelCount,
  methodologyReelCount,
  rendered: [...targetIds].filter((id) => renderedById.has(id)).length,
  inventory: sourceInventory.reelIds.length,
  channelRendered: renderedIds.length,
  deferred: deferredIds.size,
  pending: pendingIds.length,
  transcriptCards,
  noAudioCards,
  transcriptWords,
  sourceCounts,
  emptyOcrCards,
  failures: failures.slice(0, 100),
  failureCount: failures.length,
}, null, 2));
if (failures.length) process.exitCode = 1;
