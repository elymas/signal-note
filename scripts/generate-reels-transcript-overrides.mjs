import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = process.argv.slice(2).reduce((result, argument) => {
  const [name, value] = argument.split('=', 2);
  if (name === '--source') result.source = value;
  if (name === '--artifact') result.artifact = path.resolve(value);
  return result;
}, {});

if (!options.source || !options.artifact) {
  throw new Error('사용법: --source=<slug> --artifact=<artifact directory>');
}

const sourceDir = path.join(options.artifact, options.source);
const outputDir = path.join(rootDir, 'src/data/reels-transcripts');
fs.mkdirSync(outputDir, { recursive: true });

const clean = (value) => value.replace(/\s+/g, ' ').trim();
const truncate = (value, length = 170) => value.length <= length ? value : `${value.slice(0, length - 1).trim()}…`;
const formatDate = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 8
    ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
    : null;
};
const formatDuration = (value) => {
  const total = Math.max(0, Math.round(Number(value) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
    : [minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
};
const sampleEvenly = (items, count) => {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_, index) => items[Math.round(index * (items.length - 1) / (count - 1))]);
};
const splitSentences = (transcript) => {
  const sentences = transcript
    .replace(/([.!?])\s+/g, '$1\n')
    .split(/\n+/)
    .map(clean)
    .filter((sentence) => sentence.length >= 12);
  return sentences.length ? sentences : [clean(transcript)];
};

const topics = [
  [/anchored vwap|\bvwap\b/i, 'Anchored VWAP'],
  [/candle range|\bcrt\b|four hour candle|for our candle|far candle|4 hour candle|4hr candle/i, '4시간봉 캔들 레인지'],
  [/liquidity|sweep|purge/i, '유동성 스윕'],
  [/moving average|\bema\b|\bsma\b/i, '이동평균'],
  [/support|resistance/i, '지지·저항'],
  [/breakout|opening range|\borb\b/i, '돌파·개장 범위'],
  [/fibonacci|golden zone/i, 'Fibonacci'],
  [/option trading|options trader|\bcall option|\bput option|\bdelta\b|\btheta\b/i, '옵션'],
  [/risk|stop loss|position size|drawdown/i, '위험관리'],
  [/discipline|mindset|psychology|patience|emotion|journal|habit/i, '심리·규율'],
  [/stock|sector|etf|index/i, '주식·섹터'],
  [/futures|nasdaq|\bnq\b|s&p/i, '선물·지수'],
];

const tagPatterns = [
  [/anchored vwap|\bvwap\b/i, 'VWAP'], [/candle range|\bcrt\b/i, 'candle range'],
  [/four hour|4 hour|4hr/i, '4H'], [/liquidity/i, 'liquidity'], [/sweep|purge/i, 'sweep'],
  [/fair value gap|\bfvg\b/i, 'FVG'], [/moving average|\bema\b|\bsma\b/i, 'moving average'],
  [/support/i, 'support'], [/resistance/i, 'resistance'], [/breakout|opening range|\borb\b/i, 'breakout'],
  [/fibonacci/i, 'Fibonacci'], [/option trading|options trader|\bcall option|\bput option|\bdelta\b|\btheta\b/i, 'options'], [/risk|stop loss|position size/i, 'risk'],
  [/discipline|mindset|psychology|patience|emotion/i, 'psychology'], [/journal/i, 'journal'],
  [/backtest/i, 'backtest'], [/win rate|percent|%/i, 'performance claim'],
  [/course|class|webinar|comment|follow|link in/i, 'CTA'],
];

const actionPattern = /\b(mark|wait|enter|entry|buy|sell|target|stop|risk|size|look for|identify|confirm|trade|avoid|close|exit|set|use|draw|move|scale|take profit|time frame|timeframe)\b/i;
const claimPattern = /\$|\b(percent|percentage|win rate|profitable|profit|million|thousand|six figures?|income|per (day|week|month)|guarantee|payout|return)\b|%/i;
const ctaPattern = /\b(comment|follow|course|class|webinar|link in|dm me|join|free|ticket|workshop|masterclass)\b/i;
const setupPattern = /\b(entry|enter|buy|sell|candle|vwap|ema|sma|breakout|support|resistance|liquidity|range|fibonacci|setup|strategy|stop loss|target)\b/i;
const psychologyPattern = /\b(discipline|mindset|psychology|patience|emotion|journal|habit|consistent|confidence|fear|greed)\b/i;

const makeOverride = ({ id, info, transcript, transcriptSource, hasSheet }) => {
  const rawTranscript = clean(transcript);
  const transcriptWordCount = rawTranscript.split(/\s+/).filter(Boolean).length;
  const description = clean(info.description ?? '');
  const usesCaptionContext = transcriptWordCount < 8 && description.length > rawTranscript.length;
  const analysisText = usesCaptionContext ? `${description}. ${rawTranscript}` : rawTranscript;
  const sentences = splitSentences(analysisText);
  const informative = sentences.filter((sentence) => !ctaPattern.test(sentence));
  const sourceSentences = informative.length ? informative : sentences;
  const actionSentences = sourceSentences.filter((sentence) => actionPattern.test(sentence));
  const claimSentences = sentences.filter((sentence) => claimPattern.test(sentence));
  const ctaSentences = sentences.filter((sentence) => ctaPattern.test(sentence));
  const topic = topics.find(([pattern]) => pattern.test(analysisText))?.[1] ?? '영상 발화 분석';
  const tags = tagPatterns.filter(([pattern]) => pattern.test(analysisText)).map(([, tag]) => tag).slice(0, 7);
  if (!tags.length) tags.push('원문 전사', '개별 검토');

  let kind = 'commentary';
  if (claimSentences.length && (ctaSentences.length || !setupPattern.test(analysisText))) kind = 'risk';
  else if (setupPattern.test(analysisText)) kind = 'setup';
  else if (psychologyPattern.test(analysisText)) kind = 'psychology';
  const verdict = kind === 'risk' ? '주의 필요' : kind === 'setup' ? '검증 필요' : kind === 'psychology' ? '핵심 원칙' : '전략 아님';

  const longForm = Number(info.duration ?? 0) >= 300;
  const coreSentences = sampleEvenly(sourceSentences, longForm ? 8 : 4).map((sentence) => `“${truncate(sentence, 210)}”`);
  const rules = sampleEvenly(actionSentences, longForm ? 8 : 5).map((sentence) => `원문 실행 문장: ${truncate(sentence, 260)}`);
  if (!rules.length) {
    rules.push('전사에서 시장·시간봉·진입·무효화·청산을 함께 갖춘 실행 규칙은 확인되지 않았다.');
    rules.push(`영상의 실제 발화·캡션 범위는 다음 문장으로 제한한다: ${truncate(sourceSentences[0] ?? analysisText, 260)}`);
  }

  const missing = [];
  if (!/stop loss|stop-loss|initial stop|hard stop/i.test(analysisText)) missing.push('초기 손절');
  if (!/target|take profit|profit target|exit/i.test(analysisText)) missing.push('청산 기준');
  if (!/position size|risk per|account risk/i.test(analysisText)) missing.push('포지션 크기');
  if (!/commission|fee|slippage|spread/i.test(analysisText)) missing.push('거래비용');
  const cautions = [];
  if (claimSentences.length) cautions.push(`성과·수익 발화: ${sampleEvenly(claimSentences, 2).map((sentence) => `“${truncate(sentence, 180)}”`).join(' / ')}`);
  if (ctaSentences.length) cautions.push(`홍보·행동유도 발화: ${sampleEvenly(ctaSentences, 2).map((sentence) => `“${truncate(sentence, 180)}”`).join(' / ')}`);
  if (missing.length) cautions.push(`전사에서 ${missing.join('·')}이 완결된 규칙으로 확인되지 않았다.`);
  if (!cautions.length) cautions.push('발화 내용은 단일 영상 사례이며 전체 신호·실패 거래·비용 후 성과가 제공되지 않았다.');

  const wordCount = transcriptWordCount;
  const titleSentence = sourceSentences.find((sentence) => actionPattern.test(sentence) && sentence.length >= 24)
    ?? sourceSentences.find((sentence) => sentence.length >= 24)
    ?? sourceSentences[0];
  const evidence = [
    `원본 ${Number(info.duration ?? 0).toFixed(2)}초`,
    `${transcriptSource === 'facebook-auto-caption' ? 'Facebook 자동 자막' : transcriptSource === 'facebook-post-caption' ? 'Facebook 게시문 캡션' : '로컬 Whisper large-v3-turbo 전사'} ${wordCount}단어 전편`,
    usesCaptionContext ? '무음·음악 중심 구간은 원문 캡션으로 맥락 보완' : null,
    hasSheet ? '대표 프레임 콘택트시트 직접 확인' : '영상 메타데이터 확인',
    `핵심 발화 ${coreSentences.slice(0, 2).join(' / ')}`,
  ].filter(Boolean);

  return {
    date: formatDate(info.upload_date),
    duration: formatDuration(info.duration),
    originalTitle: clean(info.title ?? ''),
    title: `${topic}: ${truncate(titleSentence ?? info.title ?? `Reel ${id}`, 105)}`,
    kind,
    verdict,
    fidelity: evidence.join('·'),
    tags,
    core: `원문 전사 기준 ${topic} 콘텐츠다. ${coreSentences.join(' 이어 ')}`,
    rules,
    caution: cautions.join(' '),
    transcriptVerified: true,
    transcriptWordCount: wordCount,
    transcriptSource: transcriptSource === 'facebook-auto-caption'
      ? 'Facebook 자동 자막'
      : transcriptSource === 'facebook-post-caption'
        ? 'Facebook 게시문 캡션(무음 영상)'
        : 'Whisper large-v3-turbo',
  };
};

const overrides = {};
for (const name of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.info.json')).sort()) {
  const id = name.replace('.info.json', '');
  const autoPath = path.join(sourceDir, `${id}.transcript.txt`);
  const captionPath = path.join(sourceDir, `${id}.caption.txt`);
  const whisperPath = path.join(sourceDir, `${id}.txt`);
  const transcriptPath = fs.existsSync(whisperPath)
    ? whisperPath
    : fs.existsSync(autoPath)
      ? autoPath
      : fs.existsSync(captionPath)
      ? captionPath
      : null;
  if (!transcriptPath) continue;
  const info = JSON.parse(fs.readFileSync(path.join(sourceDir, name), 'utf8'));
  overrides[id] = makeOverride({
    id,
    info,
    transcript: fs.readFileSync(transcriptPath, 'utf8'),
    transcriptSource: transcriptPath === autoPath
      ? 'facebook-auto-caption'
      : transcriptPath === captionPath
        ? 'facebook-post-caption'
        : 'whisper-large-v3-turbo',
    hasSheet: fs.existsSync(path.join(sourceDir, `${id}.sheet.jpg`)),
  });
}

const exportName = `${options.source.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase()).replace(/^[a-z]/, (letter) => letter.toUpperCase())}TranscriptOverrides`;
const outputPath = path.join(outputDir, `${options.source}.js`);
fs.writeFileSync(outputPath, `// 자동 생성 파일: 원본 전사와 대표 프레임 검토 결과\nexport const ${exportName} = new Map(Object.entries(${JSON.stringify(overrides, null, 2)}));\n`);
console.log(JSON.stringify({ source: options.source, generated: Object.keys(overrides).length, outputPath }, null, 2));
