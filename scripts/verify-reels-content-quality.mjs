import { reelsSources } from '../src/data/reels-sources.js';

const prioritySources = new Set([
  'omar-agag',
  'yostrades',
  'trade-with-pat',
  'novo-legacy',
  'official-20-minute-trader',
  'raghee-horner',
]);
const placeholderPatterns = [
  /현재 자동 목록화 단계/,
  /원문 분석 전/,
  /추가 확인 영상/,
  /목록화하고 원문 기반 분석 대상으로 등록/,
];
const parseDuration = (value) => String(value ?? '')
  .split(':')
  .map(Number)
  .reduce((seconds, part) => (seconds * 60) + part, 0);

let failed = false;
let total = 0;
const rows = [];

for (const source of reelsSources) {
  const research = await source.load();
  const ids = research.reels.map(({ id }) => String(id));
  const unique = new Set(ids).size;
  const countMatches = source.notes === research.reelCount
    && research.reelCount === research.reels.length
    && research.reels.length === unique;
  if (!countMatches) failed = true;

  const priority = prioritySources.has(source.slug);
  const transcribed = priority
    ? research.reels.filter(({ transcriptVerified, transcriptWordCount }) => transcriptVerified === true && transcriptWordCount > 0).length
    : null;
  const placeholders = priority
    ? research.reels.filter((reel) => placeholderPatterns.some((pattern) => pattern.test([
      reel.title,
      reel.core,
      reel.caution,
      reel.fidelity,
    ].join(' ')))).length
    : null;
  const lowDensityLongForm = priority
    ? research.reels.filter((reel) => {
      const duration = parseDuration(reel.duration);
      return duration >= 300 && reel.transcriptWordCount / (duration / 60) < 40;
    }).length
    : null;
  if (priority && (
    transcribed !== research.reels.length
    || placeholders !== 0
    || lowDensityLongForm !== 0
  )) failed = true;
  total += research.reels.length;
  rows.push({
    slug: source.slug,
    registry: source.notes,
    declared: research.reelCount,
    rendered: research.reels.length,
    unique,
    transcribed,
    placeholders,
    lowDensityLongForm,
    pass: countMatches && (!priority || (
      transcribed === research.reels.length
      && placeholders === 0
      && lowDensityLongForm === 0
    )),
  });
}

console.table(rows);
console.log(JSON.stringify({ renderedTotal: total, failed }, null, 2));
if (failed) process.exitCode = 1;
