import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reelsSources } from '../src/data/reels-sources.js';
import { reelEditorialOverrides20260904 } from '../src/data/reels-updates/editorial-overrides-2026-09-04.js';
import { youtubeResearchChannels, youtubeResearchVideos } from '../src/data/youtube-research-data.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audit = JSON.parse(fs.readFileSync(path.join(rootDir, 'research/video-inventory/update-audit-2026-09-04.json'), 'utf8'));
const artifactRoot = path.join(rootDir, 'artifacts/video-update-2026-09-04');
const targetFacebook = new Map(audit.facebook.flatMap((source) => source.newIds.map((id) => [id, source.slug])));
const targetYoutube = new Map(audit.youtube.flatMap((source) => source.newIds.map((id) => [id, source.slug])));
const processPattern = /스크롤|목록 등록|추가 확인된 공개|전사 작업|분석 대상으로 등록/;
const brokenEditorialPattern = /트레이딩 화면을 활용한 짧은 장면|트레이딩 화면과 음악 또는 짧은 반응|공정가ap|스팩핑|프로포즈드 계정|브ulls|그라프팅/;
const foreignPattern = /[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30ff\u0400-\u04ff\ufffd]/;
const koreanPattern = /[가-힣]/;
const parseDuration = (value) => String(value ?? '').split(':').map(Number).reduce((seconds, part) => (seconds * 60) + part, 0);
const hasRawEnglish = (value) => {
  let run = 0;
  for (const token of String(value).split(/\s+/)) {
    run = /^[A-Za-z][A-Za-z'-]{2,}[.,!?;:]?$/.test(token) ? run + 1 : 0;
    if (run >= 8) return true;
  }
  return false;
};

const failures = [];
if (reelEditorialOverrides20260904.size !== targetFacebook.size) {
  failures.push(`facebook: expected ${targetFacebook.size} editorial reviews, got ${reelEditorialOverrides20260904.size}`);
}
const facebookRows = [];
const seenFacebook = new Set();
for (const source of reelsSources) {
  const research = await source.load();
  const ids = research.reels.map(({ id }) => String(id));
  if (ids.length !== new Set(ids).size) failures.push(`${source.slug}: duplicate rendered IDs`);
  if (research.reelCount !== ids.length || source.notes !== ids.length) failures.push(`${source.slug}: registry/declared/rendered mismatch`);
  const updates = research.reels.filter((reel) => targetFacebook.get(String(reel.id)) === source.slug);
  for (const reel of updates) {
    const id = String(reel.id);
    seenFacebook.add(id);
    const visible = [reel.title, reel.core, ...(reel.rules ?? []), reel.cta, reel.caution].join(' ');
    if (!(reel.title && reel.core && reel.rules?.length && reel.cta && reel.caution && reel.kind && reel.verdict && reel.tags?.length)) failures.push(`${source.slug}/${id}: incomplete card`);
    if (reel.transcriptVerified !== true || !(reel.transcriptWordCount > 0) || !reel.transcriptSource) failures.push(`${source.slug}/${id}: transcript evidence missing`);
    if (!reelEditorialOverrides20260904.has(id)) failures.push(`${source.slug}/${id}: editorial review missing`);
    if (!koreanPattern.test(visible) || foreignPattern.test(visible) || processPattern.test(visible) || brokenEditorialPattern.test(visible) || hasRawEnglish(visible)) failures.push(`${source.slug}/${id}: visible text quality failure`);
    const seconds = parseDuration(reel.duration);
    if (seconds >= 300 && reel.transcriptWordCount / (seconds / 60) < 40) failures.push(`${source.slug}/${id}: low-density long transcript`);
    const artifactDir = path.join(artifactRoot, 'facebook', source.slug);
    if (!fs.existsSync(path.join(artifactDir, `${id}.info.json`))) failures.push(`${source.slug}/${id}: metadata artifact missing`);
    if (!fs.existsSync(path.join(artifactDir, `${id}.sheet.jpg`))) failures.push(`${source.slug}/${id}: contact sheet missing`);
    if (!fs.existsSync(path.join(artifactDir, `${id}.visual.txt`))) failures.push(`${source.slug}/${id}: visual OCR missing`);
    const artifactNames = fs.existsSync(artifactDir) ? fs.readdirSync(artifactDir) : [];
    if (!artifactNames.some((name) => name.startsWith(`${id}.visual.`))) failures.push(`${source.slug}/${id}: raw visual media missing`);
    if (!artifactNames.some((name) => name === `${id}.txt` || name === `${id}.transcript.txt` || name === `${id}.caption.txt`)) failures.push(`${source.slug}/${id}: full transcript artifact missing`);
    if (/whisper/i.test(reel.transcriptSource) && !fs.existsSync(path.join(artifactDir, `${id}.m4a`))) failures.push(`${source.slug}/${id}: transcription audio missing`);
  }
  facebookRows.push({ slug: source.slug, registry: source.notes, declared: research.reelCount, rendered: ids.length, unique: new Set(ids).size, newAnalyzed: updates.length });
}
for (const id of targetFacebook.keys()) if (!seenFacebook.has(id)) failures.push(`facebook target not rendered: ${id}`);

const youtubeIds = youtubeResearchVideos.map(({ id }) => String(id));
if (youtubeIds.length !== new Set(youtubeIds).size) failures.push('youtube: duplicate rendered IDs');
if (youtubeIds.length !== 199) failures.push(`youtube: expected 199 rendered, got ${youtubeIds.length}`);
const seenYoutube = new Set();
for (const video of youtubeResearchVideos.filter((item) => targetYoutube.has(String(item.id)))) {
  const id = String(video.id);
  seenYoutube.add(id);
  const visible = [video.title, video.thesis, ...(video.rules ?? []), video.claims, video.cta, video.risk].join(' ');
  if (!(video.title && video.thesis && video.rules?.length && video.claims && video.cta && video.risk && video.kind && video.pattern && video.theme && video.subject)) failures.push(`youtube/${id}: incomplete card`);
  if (video.transcriptVerified !== true || !(video.transcriptWordCount > 0) || !video.transcriptSource) failures.push(`youtube/${id}: transcript evidence missing`);
  if (!koreanPattern.test(visible) || foreignPattern.test(visible) || processPattern.test(visible) || hasRawEnglish(visible)) failures.push(`youtube/${id}: visible text quality failure`);
  const seconds = parseDuration(video.duration);
  if (seconds >= 300 && video.transcriptWordCount / (seconds / 60) < 40) failures.push(`youtube/${id}: low-density long transcript`);
  const directory = path.join(artifactRoot, 'youtube', video.channelSlug, id);
  for (const name of [`${id}.info.json`, `${id}.source.mp4`, `${id}.m4a`, `${id}.sheet.jpg`, `${id}.visual.txt`]) {
    if (!fs.existsSync(path.join(directory, name))) failures.push(`youtube/${id}: artifact missing ${name}`);
  }
}
for (const id of targetYoutube.keys()) if (!seenYoutube.has(id)) failures.push(`youtube target not rendered: ${id}`);
for (const channel of youtubeResearchChannels) {
  const rendered = youtubeResearchVideos.filter((video) => video.channelId === channel.id).length;
  if (rendered !== channel.publicVideos) failures.push(`${channel.slug}: public/rendered mismatch ${channel.publicVideos}/${rendered}`);
}

console.table(facebookRows);
console.log(JSON.stringify({
  facebook: { target: targetFacebook.size, rendered: seenFacebook.size },
  youtube: { target: targetYoutube.size, rendered: seenYoutube.size, totalRendered: youtubeIds.length },
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
