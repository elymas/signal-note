// 릴스 출처 레지스트리.
// 새 채널을 추가할 때는 표준 모듈(src/data/reels-pages/<slug>.js)을 만들고
// 아래 목록에 한 줄을 추가하면 됩니다. 카드 수·재생 시간·요약 통계는
// 데이터 모듈에서 자동으로 계산되므로 UI를 직접 고칠 필요가 없습니다.
// notes 는 목록 칩에 먼저 표시되는 힌트 값이고, 데이터가 로드되면 실제 값으로 대체됩니다.

async function loadStandardResearch(modulePromise) {
  const module = await modulePromise;
  const research = Object.values(module).find((value) => value && Array.isArray(value.reels));
  if (!research) throw new Error('reels 배열을 가진 export를 찾지 못했습니다.');
  return research;
}

export const reelsSources = [
  { slug: 'ahmed-on-chart', profileName: 'Ahmed On Chart', notes: 127, load: () => loadStandardResearch(import('./reels-pages/ahmed-on-chart.js')) },
  { slug: 'travis-woo', profileName: 'Travis Woo', notes: 690, load: () => loadStandardResearch(import('./reels-pages/travis-woo.js')) },
  { slug: 'tarzan-trading-tt', profileName: 'Tarzan Trading TT', notes: 394, load: () => loadStandardResearch(import('./reels-pages/tarzan-trading-tt.js')) },
  { slug: 'erick-jablonski', profileName: 'Erick Jablonski', notes: 977, load: () => loadStandardResearch(import('./reels-pages/erick-jablonski.js')) },
  { slug: 'luxalgo', profileName: 'LuxAlgo', notes: 223, load: () => loadStandardResearch(import('./reels-pages/luxalgo.js')) },
  { slug: 'trader-note-jason', profileName: 'TradersNotes Jason', notes: 129, load: () => loadStandardResearch(import('./reels-pages/trader-note-jason.js')) },
  { slug: 'dumb-hunter', profileName: 'Dumb Hunter', notes: 511, load: () => loadStandardResearch(import('./reels-pages/dumb-hunter.js')) },
  { slug: 'coin-announcer', profileName: '코인하는 아나운서', notes: 275, load: () => loadStandardResearch(import('./reels-pages/coin-announcer.js')) },
  {
    slug: 'max-anthony',
    profileName: 'Max Anthony',
    notes: 851,
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
        reels: reelResearch.map((reel) => ({ ...reel, sourceUrl: createReelUrl(reel.id) })),
      };
    },
  },
  { slug: 'omar-agag', profileName: 'Omar Agag', notes: 49, load: () => loadStandardResearch(import('./reels-pages/omar-agag.js')) },
  { slug: 'yostrades', profileName: 'yostrades', notes: 10, load: () => loadStandardResearch(import('./reels-pages/yostrades.js')) },
  { slug: 'trade-with-pat', profileName: 'Trade with Pat', notes: 60, load: () => loadStandardResearch(import('./reels-pages/trade-with-pat.js')) },
  { slug: 'novo-legacy', profileName: 'Novo Legacy', notes: 106, load: () => loadStandardResearch(import('./reels-pages/novo-legacy.js')) },
];

export const reelsSourcesBySlug = new Map(reelsSources.map((source) => [source.slug, source]));

export const reelsArchiveNotes = reelsSources.reduce((total, source) => total + source.notes, 0);
