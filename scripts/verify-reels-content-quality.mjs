import { reelsSources } from '../src/data/reels-sources.js';
import { legacyPlaceholderCorrections } from '../src/data/reels-transcripts/legacy-placeholder-corrections.js';

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
  /스크롤 끝에서 추가 확인된 공개 릴스/,
  /페이지 끝까지 로드된 추가 릴스/,
  /고유 ID를 연구 목록에 등록/,
  /원문 전사 기준/,
  /영상 발화 분석 콘텐츠/,
  /원문 실행 문장/,
  /시장 분석에 관한 트레이딩 관점/,
  /트레이딩 화면을 활용한 짧은 장면/,
  /스tone\s+Ages|오mar|이mpulse|세CTOR|레TAIL|플lux|퍼फ리/i,
];
const foreignTextPattern = /[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30ff\u0400-\u04ff\ufffd]/;
const koreanPattern = /[가-힣]/;
const visibleText = (reel) => [
  reel.title,
  reel.core,
  ...(Array.isArray(reel.rules) ? reel.rules : []),
  reel.caution,
].join(' ');
const hasRawEnglishSentence = (value) => {
  let consecutive = 0;
  for (const token of String(value).split(/\s+/)) {
    consecutive = /^[A-Za-z][A-Za-z'-]{2,}[.,!?;:]?$/.test(token) ? consecutive + 1 : 0;
    if (consecutive >= 6) return true;
  }
  return false;
};
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
  const legacyIds = new Set(legacyPlaceholderCorrections.get(source.slug)?.keys() ?? []);
  const qualityReels = priority
    ? research.reels
    : research.reels.filter((reel) => legacyIds.has(String(reel.id)));
  const transcribed = priority
    ? research.reels.filter(({ transcriptVerified, transcriptWordCount }) => transcriptVerified === true && transcriptWordCount > 0).length
    : null;
  const placeholders = research.reels.filter((reel) => placeholderPatterns.some((pattern) => pattern.test([
      reel.title,
      reel.core,
      reel.caution,
      reel.fidelity,
    ].join(' ')))).length;
  const rawEnglish = qualityReels.filter((reel) => hasRawEnglishSentence(visibleText(reel))).length;
  const foreignText = qualityReels.filter((reel) => foreignTextPattern.test(visibleText(reel))).length;
  const missingKorean = qualityReels.filter((reel) => !koreanPattern.test(visibleText(reel))).length;
  const incompleteCards = qualityReels.filter((reel) => !(
    reel.title
    && reel.core
    && Array.isArray(reel.rules)
    && reel.rules.length
    && reel.caution
    && reel.kind
    && reel.verdict
    && Array.isArray(reel.tags)
    && reel.tags.length
  )).length;
  const lowDensityLongForm = priority
    ? research.reels.filter((reel) => {
      const duration = parseDuration(reel.duration);
      return duration >= 300 && reel.transcriptWordCount / (duration / 60) < 40;
    }).length
    : null;
  if (priority && (
    transcribed !== research.reels.length
    || lowDensityLongForm !== 0
  )) failed = true;
  if (placeholders !== 0 || rawEnglish !== 0 || foreignText !== 0 || missingKorean !== 0 || incompleteCards !== 0) {
    failed = true;
  }
  total += research.reels.length;
  rows.push({
    slug: source.slug,
    registry: source.notes,
    declared: research.reelCount,
    rendered: research.reels.length,
    unique,
    qualityChecked: qualityReels.length,
    transcribed,
    placeholders,
    rawEnglish,
    foreignText,
    missingKorean,
    incompleteCards,
    lowDensityLongForm,
    pass: countMatches
      && placeholders === 0
      && rawEnglish === 0
      && foreignText === 0
      && missingKorean === 0
      && incompleteCards === 0
      && (!priority || (
      transcribed === research.reels.length
      && lowDensityLongForm === 0
      )),
  });
}

console.table(rows);
console.log(JSON.stringify({ renderedTotal: total, failed }, null, 2));
if (failed) process.exitCode = 1;
