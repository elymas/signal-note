// 릴스 출처 레지스트리.
// 새 채널을 추가할 때는 표준 모듈(src/data/reels-pages/<slug>.js)을 만들고
// 아래 목록에 한 줄을 추가하면 됩니다. 카드 수·재생 시간·요약 통계는
// 데이터 모듈에서 자동으로 계산되므로 UI를 직접 고칠 필요가 없습니다.
// notes 는 목록 칩에 먼저 표시되는 힌트 값이고, 데이터가 로드되면 실제 값으로 대체됩니다.

import { DumbHunterTranscriptOverrides } from './reels-transcripts/dumb-hunter.js';
import { ErickJablonskiTranscriptOverrides } from './reels-transcripts/erick-jablonski.js';
import { LuxalgoTranscriptOverrides } from './reels-transcripts/luxalgo.js';
import { legacyPlaceholderCorrections } from './reels-transcripts/legacy-placeholder-corrections.js';
import { MaxAnthonyTranscriptOverrides } from './reels-transcripts/max-anthony.js';
import { recentKoreanCorrections } from './reels-transcripts/recent-korean-corrections.js';
import { TraderNoteJasonTranscriptOverrides } from './reels-transcripts/trader-note-jason.js';

const recoveredTranscriptOverrides = new Map([
  ['dumb-hunter', DumbHunterTranscriptOverrides],
  ['erick-jablonski', ErickJablonskiTranscriptOverrides],
  ['luxalgo', LuxalgoTranscriptOverrides],
  ['max-anthony', MaxAnthonyTranscriptOverrides],
  ['trader-note-jason', TraderNoteJasonTranscriptOverrides],
]);

const koreanReworkSources = new Set([
  'omar-agag',
  'yostrades',
  'trade-with-pat',
  'novo-legacy',
  'official-20-minute-trader',
  'raghee-horner',
]);

const editorialReplacements = [
  [/오mar은/gi, '오마르는'],
  [/오mar는/gi, '오마르는'],
  [/오mar/gi, '오마르'],
  [/마rch/gi, '3월'],
  [/엔กulfing\s*(?:bar|바)?/gi, '장악형 캔들'],
  [/engulfing\s+bar\s+play/gi, '장악형 캔들 셋업'],
  [/bullish\s+engulfing/gi, '상승 장악형'],
  [/bearish\s+engulfing/gi, '하락 장악형'],
  [/engulfing\s*(?:bar|바)?/gi, '장악형 캔들'],
  [/\bbullish\b/gi, '강세'],
  [/\bbearish\b/gi, '약세'],
  [/\bliquidity sweeps?\b/gi, '유동성 스윕'],
  [/\bliquidity\b/gi, '유동성'],
  [/candlerange theory/gi, '캔들 범위 이론'],
  [/wick rejection/gi, '꼬리 반전'],
  [/\bbreakout\b/gi, '돌파'],
  [/\bretracement\b/gi, '되돌림'],
  [/\bdowntrend\b/gi, '하락 추세'],
  [/\buptrend\b/gi, '상승 추세'],
  [/\bsupply\s*&\s*demand\b/gi, '수요·공급'],
  [/\bsupply\b/gi, '공급'],
  [/\bdemand\b/gi, '수요'],
  [/\bsetup\b/gi, '셋업'],
  [/\bTrader(?:s)?\b/gi, '트레이더'],
  [/\bFibonacci\b/gi, '피보나치'],
  [/\bstagflation\b/gi, '스태그플레이션'],
  [/\bwhite line\b/gi, '흰색 선'],
  [/\btake profit\b/gi, '익절'],
  [/\bstop[- ]loss\b/gi, '손절'],
  [/\bTrend divergence\b/gi, '추세 다이버전스'],
  [/\bDollar cost averaging\b/gi, '분할 매수'],
  [/\bPut call parity\b/gi, '풋-콜 패리티'],
  [/\bliquidation heatmaps?\b/gi, '청산 히트맵'],
  [/\bsubconscious mind\b/gi, '잠재의식'],
  [/\bstrict rules\b/gi, '엄격한 규칙'],
  [/\bwider stops\b/gi, '넓은 손절폭'],
  [/\bdemo\s+계정/gi, '모의 계정'],
  [/\bmillionaires?\b/gi, '백만장자'],
  [/Dow Jones Industrial Average/gi, '다우존스 산업평균지수'],
  [/Dow Jones/gi, '다우존스'],
  [/Tech\s+(?:stock|스토크)/gi, '기술주'],
  [/SMP\s*500/gi, 'S&P 500'],
  [/PE\s*Ratio|PERatio/gi, '주가수익비율'],
  [/Fantasy와 Delusion/gi, '환상과 착각'],
  [/Iran과 US/gi, '이란과 미국'],
  [/Dubai와 Iran/gi, '두바이와 이란'],
  [/프로피어(?:드|티)\s*트레이딩/gi, '프롭 트레이딩'],
  [/프로피어드\s*데일리\s*퍼AYOUT/gi, '프롭 계정 일일 지급금'],
  [/농도\s*셋업/gi, '합류 조건 셋업'],
  [/이전 주의 농도/gi, '이전 주의 합류 조건'],
  [/농도가 전일 고가/gi, '여러 조건이 전일 고가'],
  [/발산이 농도가 높을수록/gi, '다이버전스 강도가 높을수록'],
  [/마ansion/gi, '저택'],
  [/가old/gi, '금'],
  [/공정가(?:ap|격대)/gi, '공정가치갭'],
  [/공정가격갭|공정값\s*(?:텀|갭)/gi, '공정가치갭'],
  [/스폽ping/gi, '스캘핑'],
  [/스팩핑/gi, '스캘핑'],
  [/캔들스weep/gi, '캔들 스윕'],
  [/나스daq/gi, '나스닥'],
  [/데bt/gi, '빚'],
  [/매ornings/gi, '매일 아침'],
  [/캔들sticks?|캐andle/gi, '캔들'],
  [/\bcandle\b/gi, '캔들'],
  [/펜\s*바|pin\s*바/gi, '핀바'],
  [/오mar/gi, '오마르'],
  [/역\s*추매/g, '반대 방향 진입'],
  [/반대 방향 진입를/g, '반대 방향 진입을'],
  [/스플리치|스플리트/gi, '유동성 스윕'],
  [/펌블백/gi, '되돌림'],
  [/스탑[- ]?loss|스탑\s*러스/gi, '손절'],
  [/손절를/g, '손절을'],
  [/손절는/g, '손절은'],
  [/타겟팅/g, '목표 설정'],
  [/타겟/g, '목표'],
  [/engulfing\s*(?:bar|바)/gi, '장악형 캔들'],
  [/liquidity\s*sweep/gi, '유동성 스윕'],
  [/retracement/gi, '되돌림'],
  [/Bearish/gi, '약세'],
  [/강세\s*breaker|볼리시\s*퍼커터/gi, '강세 브레이커'],
  [/페인트백/gi, '되돌림'],
  [/\/ORB/gi, 'ORB'],
  [/성공은트레이딩/g, '성공은 트레이딩'],
  [/몇 일/g, '며칠'],
  [/구체적인 매매 규칙은 제시되지 않음\.?/g, '구체적인 매매 규칙은 제시되지 않는다.'],
  [/Fundamentals/gi, '펀더멘털'],
  [/도우존(?:스)?\s*(?:산업평균지수)?/gi, '다우존스 산업평균지수'],
  [/테크\s*스톡/gi, '기술주'],
  [/블루\s*라인/gi, '파란선'],
  [/백\s*라인/gi, '검은선'],
  [/레지스턴스/gi, '저항선'],
  [/Raghee\s+Horner/gi, '래기 호너'],
  [/Raggy\s+Horner/gi, '래기 호너'],
  [/\bOmar\b/gi, '오마르'],
  [/Fair\s+Value\s+Gap/gi, '공정가치갭'],
  [/sell\s+zone/gi, '매도 구간'],
  [/Eastern\s+(?:Standard\s+)?Time/gi, '미 동부시간'],
  [/\bDay\s+(\d+)\b/gi, '$1일 차'],
  [/\bdaily\s+gap\b/gi, '일봉 갭'],
  [/\bHigher\s+High\b/gi, '더 높은 고점'],
  [/\bLower\s+Low\b/gi, '더 낮은 저점'],
  [/\bEqual\s+High\b/gi, '동일 고점'],
  [/\bStandard\s+Deviation\b/gi, '표준편차'],
  [/\bDivergence\b/gi, '다이버전스'],
  [/\bback\s*test\b/gi, '백테스트'],
  [/\bForex\b/gi, '외환'],
  [/\bReels\b/gi, '릴스'],
  [/\bLive\b/gi, '실시간'],
  [/\bFREE\b/g, '무료'],
  [/\bCLASS\b/g, '수업'],
  [/\bSECTOR\b/gi, '섹터'],
  [/ANCHWAP/gi, '앵커드 VWAP'],
  [/Tradeview/gi, 'TradingView'],
  [/time-tested/gi, '오랫동안 검증된'],
  [/\bFIER\b/g, '4시간'],
  [/스queeze/gi, '스퀴즈'],
  [/랜드스weep/gi, '범위 스윕'],
  [/\baccumulation\b/gi, '축적'],
  [/\boverlay\b/gi, '오버레이'],
  [/\btarget\b/gi, '목표'],
  [/\blows\b/gi, '저점'],
  [/\bhigh\b/gi, '고점'],
  [/\blow\b/gi, '저점'],
  [/구매 구간/g, '매수 구간'],
  [/구매한 주식/g, '매수한 주식'],
  [/주식을 판매/g, '주식을 매도'],
  [/높고 낮은 (?:점|가격)/g, '고점과 저점'],
  [/캔들 높고 낮은 점/g, '캔들 고점과 저점'],
  [/스피드를 잃을 때/g, '모멘텀이 약해질 때'],
  [/레버리지된 거래/g, '레버리지를 사용한 거래'],
  [/가격하락/g, '가격 하락'],
  [/가격상승/g, '가격 상승'],
  [/한캔들/g, '한 개 캔들'],
  [/제품 캔들/g, '이전 캔들'],
  [/캔들 바의 오픈 가격/g, '캔들의 시가'],
  [/폐쇄가 /g, '종가가 '],
  [/가격이 빠지면 역발주로 진입/g, '가격이 되돌릴 때 반대 방향으로 진입'],
  [/장타입 매수/g, '롱 진입'],
  [/자기ipline/gi, '자기규율'],
  [/데브리gence/gi, '다이버전스'],
  [/콘solidation/gi, '횡보'],
  [/이arnings/gi, '실적'],
  [/가aps/gi, '갭'],
  [/스(?:top|TOP)\s*라(?:스스|스즈)/g, '손절'],
  [/펀DED/gi, '펀딩된'],
  [/매수-limit/gi, '지정가 매수'],
  [/스탑-loss/gi, '손절'],
  [/\bcustom session\b/gi, '사용자 지정 세션'],
  [/\bpop down\b/gi, '아래로 꺾여'],
  [/\bshort trades?\b/gi, '숏 거래'],
  [/\blong trades?\b/gi, '롱 거래'],
  [/\bbear trap\b/gi, '약세 함정'],
  [/\bTrap\b/g, '함정'],
  [/\btrading identity\b/gi, '트레이딩 정체성'],
  [/\b5AM Eastern Time/gi, '미 동부시간 오전 5시 '],
  [/\b(\d{1,2}):?(\d{2})?\s*AM\b/gi, (_, hour, minute) => `오전 ${hour}${minute ? `시 ${minute}분` : '시'}`],
  [/\b(\d{1,2}):?(\d{2})?\s*PM\b/gi, (_, hour, minute) => `오후 ${hour}${minute ? `시 ${minute}분` : '시'}`],
  [/\/?ORB\s+시장/g, 'ORB 기준'],
  [/뉴욕 시각을트레이딩 View/g, 'TradingView의 시간대를 뉴욕 시각으로'],
  [/뉴욕 시각을TradingView에/g, 'TradingView의 시간대를 뉴욕 시각으로'],
  [/파인더를트레이딩 View에/g, '파인더를 TradingView에'],
  [/트레이딩 View/g, 'TradingView'],
  [/\bApple\b/g, '애플'],
  [/\bidentity\b/gi, '정체성'],
  [/\$X0k\/month/gi, '월 수만 달러'],
  [/\b(\d+(?:~\d+)?)\s*pips?\b/gi, '$1핍'],
  [/\btrading\b/gi, '트레이딩'],
  [/\bFOMO\b/g, '추격 매수 불안'],
  [/스tone\s+Ages/gi, '석기 시대'],
  [/오mar/gi, '오마르'],
  [/이mpulse/gi, '충동'],
  [/세CTOR/gi, '섹터'],
  [/신Silver/gi, '은'],
  [/가ap/gi, '갭'],
  [/플lux/gi, '플로'],
  [/유동성\s+suite/gi, '유동성 스윕'],
  [/레TAIL/gi, '개인'],
  [/퍼फ리/gi, '수익'],
  [/프로피어(?:\s+회사)?/g, '프롭 회사'],
  [/프로피엠/g, '프롭 회사'],
  [/스컬피지/g, '스캘핑'],
  [/하늘꼬리/g, '긴 위꼬리'],
  [/워키포프/g, '와이코프'],
  [/\bHFT\b/g, '상위 시간대'],
  [/\bLFT\b/g, '하위 시간대'],
  [/다비스/g, '다바스'],
  [/도지,?\s*힙퍼,?\s*업GBK,?\s*하램이,?\s*마루보조/g, '도지·해머·상승 장악형·하라미·마루보주'],
  [/힙퍼 캔들/g, '해머 캔들'],
  [/업GBK 캔들/g, '상승 장악형 캔들'],
  [/하램이/g, '하라미'],
  [/마루보조/g, '마루보주'],
  [/TAKE\s*PROFIT/gi, '익절'],
  [/테이크\s*프로FIT/gi, '익절'],
  [/유동성가/g, '유동성이'],
  [/유동성를/g, '유동성을'],
  [/스윕가/g, '스윕이'],
  [/고점와 저점를/g, '고점과 저점을'],
  [/목표은/g, '목표는'],
  [/미국가 합의/g, '미국이 합의'],
  [/포지션 크기이 /g, '포지션 크기가 '],
  [/손절를 /g, '손절을 '],
  [/다우존스과/g, '다우존스와'],
  [/돌파이/g, '돌파가'],
  [/돌파을/g, '돌파를'],
  [/스윕를/g, '스윕을'],
  [/잠재의식가/g, '잠재의식이'],
  [/진입을 실행합니다/g, '진입한다'],
  [/제시되지 않음$/g, '제시되지 않는다.'],
];

const normalizeEditorialKorean = (value) => {
  let normalized = String(value ?? '');
  for (const [pattern, replacement] of editorialReplacements) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/역\s*전/g, '역전')
    .replace(/\s+/g, ' ')
    .trim();
};

const applyRecoveredTranscript = (slug, reel) => {
  const merged = {
    ...reel,
    ...(recoveredTranscriptOverrides.get(slug)?.get(String(reel.id)) ?? {}),
    ...(legacyPlaceholderCorrections.get(slug)?.get(String(reel.id)) ?? {}),
    ...(recentKoreanCorrections.get(slug)?.get(String(reel.id)) ?? {}),
  };
  if (!koreanReworkSources.has(slug)) return merged;
  return {
    ...merged,
    title: normalizeEditorialKorean(merged.title),
    core: normalizeEditorialKorean(merged.core),
    rules: Array.isArray(merged.rules) ? merged.rules.map(normalizeEditorialKorean) : merged.rules,
    caution: normalizeEditorialKorean(merged.caution),
    tags: Array.isArray(merged.tags)
      ? [...new Set(merged.tags.map(normalizeEditorialKorean).filter(Boolean))]
      : merged.tags,
  };
};

async function loadStandardResearch(modulePromise) {
  const module = await modulePromise;
  const research = Object.values(module).find((value) => value && Array.isArray(value.reels));
  if (!research) throw new Error('reels 배열을 가진 export를 찾지 못했습니다.');

  // 2026-08-25 추가 감사 때 일부 Reel 객체가 reels가 아니라 methodology나
  // commonPrinciples에 잘못 삽입됐다. 상세 페이지와 출처 카드가 서로 다른
  // 수를 표시하지 않도록 실제 객체를 reels로 회수하고 설명 배열에서는 뺀다.
  const normalized = { ...research };
  const misplacedReels = [];

  for (const [key, value] of Object.entries(research)) {
    if (key === 'reels' || !Array.isArray(value)) continue;
    const misplaced = value.filter((item) => item && typeof item === 'object' && item.id);
    if (!misplaced.length) continue;
    misplacedReels.push(...misplaced);
    normalized[key] = value.filter((item) => !(item && typeof item === 'object' && item.id));
  }

  const reelsById = new Map(
    [...research.reels, ...misplacedReels].map((reel) => [String(reel.id), reel]),
  );
  normalized.reels = [...reelsById.values()].map((reel) =>
    applyRecoveredTranscript(normalized.slug, reel));
  normalized.reelCount = normalized.reels.length;
  return normalized;
}

export const reelsSources = [
  { slug: 'ahmed-on-chart', profileName: 'Ahmed On Chart', notes: 130, load: () => loadStandardResearch(import('./reels-pages/ahmed-on-chart.js')) },
  { slug: 'travis-woo', profileName: 'Travis Woo', notes: 702, load: () => loadStandardResearch(import('./reels-pages/travis-woo.js')) },
  { slug: 'tarzan-trading-tt', profileName: 'Tarzan Trading TT', notes: 396, load: () => loadStandardResearch(import('./reels-pages/tarzan-trading-tt.js')) },
  { slug: 'erick-jablonski', profileName: 'Erick Jablonski', notes: 979, load: () => loadStandardResearch(import('./reels-pages/erick-jablonski.js')) },
  { slug: 'luxalgo', profileName: 'LuxAlgo', notes: 224, load: () => loadStandardResearch(import('./reels-pages/luxalgo.js')) },
  { slug: 'trader-note-jason', profileName: 'TradersNotes Jason', notes: 132, load: () => loadStandardResearch(import('./reels-pages/trader-note-jason.js')) },
  { slug: 'dumb-hunter', profileName: 'Dumb Hunter', notes: 525, load: () => loadStandardResearch(import('./reels-pages/dumb-hunter.js')) },
  { slug: 'coin-announcer', profileName: '코인하는 아나운서', notes: 275, load: () => loadStandardResearch(import('./reels-pages/coin-announcer.js')) },
  {
    slug: 'max-anthony',
    profileName: 'Max Anthony',
    notes: 856,
    load: async () => {
      const { getReelUrl: createReelUrl, reelResearch, reelsResearchMeta } = await import('./reels-research-data.js');
      return {
        slug: 'max-anthony',
        profileName: reelsResearchMeta.profileName,
        canonicalProfileUrl: reelsResearchMeta.profileUrl,
        analyzedAt: reelsResearchMeta.analyzedAt,
        publishedRange: reelsResearchMeta.publishedRange,
        reelCount: reelResearch.length,
        totalDuration: reelsResearchMeta.totalDuration,
        methodology: '공개 릴스 탭 전체를 수집한 뒤 자동 전사와 영상 맥락을 교차 확인하고, 재현 가능한 조건이 없는 영상은 전략 아님으로 분리했다.',
        commonPrinciples: [
          { code: 'RISK FIRST', title: '셋업보다 생존', copy: '레버리지·마진·일일 손실 한도는 진입 신호보다 먼저 정의합니다.' },
          { code: 'CLEAN SPACE', title: '왼쪽을 확인', copy: '돌파 직후 저항까지 남은 공간이 목표 위험비를 충족하는지 확인합니다.' },
          { code: 'RE-ENTRY', title: '가설과 주문을 분리', copy: '첫 주문이 끝나도 가설이 유효하면 새 트리거에서 제한적으로 재진입합니다.' },
          { code: 'VALIDATE', title: '이름보다 규칙', copy: 'FVG·오더플로 같은 용어는 진입·무효화·비용 규칙으로 번역한 뒤 검증합니다.' },
        ],
        reels: reelResearch.map((reel) => applyRecoveredTranscript('max-anthony', {
          ...reel,
          sourceUrl: createReelUrl(reel.id),
        })),
      };
    },
  },
  { slug: 'omar-agag', profileName: 'Omar Agag', notes: 49, load: () => loadStandardResearch(import('./reels-pages/omar-agag.js')) },
  { slug: 'yostrades', profileName: 'yostrades', notes: 36, load: () => loadStandardResearch(import('./reels-pages/yostrades.js')) },
  { slug: 'trade-with-pat', profileName: 'Trade with Pat', notes: 121, load: () => loadStandardResearch(import('./reels-pages/trade-with-pat.js')) },
  { slug: 'novo-legacy', profileName: 'Novo Legacy', notes: 106, load: () => loadStandardResearch(import('./reels-pages/novo-legacy.js')) },
  { slug: 'official-20-minute-trader', profileName: '20-Minute Trader', notes: 371, load: () => loadStandardResearch(import('./reels-pages/official-20-minute-trader.js')) },
  { slug: 'raghee-horner', profileName: 'Raghee Horner', notes: 247, load: () => loadStandardResearch(import('./reels-pages/raghee-horner.js')) },
];

export const reelsSourcesBySlug = new Map(reelsSources.map((source) => [source.slug, source]));

export const reelsArchiveNotes = reelsSources.reduce((total, source) => total + source.notes, 0);
