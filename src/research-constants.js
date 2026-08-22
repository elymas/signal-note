// 공개 사이트 통계. AUDIT 값은 감사 문서 기준, ARCHIVE 값은 데이터 레지스트리 기준.
export const researchStats = {
  reelsSources: 11,
  reelsAnalyzed: 5492,
  reelsInventory: 5495,
  youtubeChannels: 3,
  youtubeVideos: 154,
  youtubeLongForm: 94,
  youtubeShorts: 60,
  restrictedVideos: 0,
  auditedAt: '2026.08.23',
};

export const researchModules = [
  {
    index: '01',
    href: '/reels',
    kicker: 'FACEBOOK / REELS',
    title: '릴스 리서치',
    description: '11개 공개 프로필의 릴스를 출처별로 전사하고, 셋업·리스크·심리·논평을 재현 가능성 기준으로 분류합니다.',
    metric: '5,492',
    metricLabel: 'ANALYZED NOTES',
    accent: 'coral',
  },
  {
    index: '02',
    href: '/youtube',
    kicker: 'YOUTUBE / CHANNELS',
    title: '유튜브 분석',
    description: '3개 채널의 공개 영상 전체를 제목·설명·자막과 대조하고, 성과 주장과 실행 규칙을 분리합니다.',
    metric: '154',
    metricLabel: 'PUBLIC VIDEOS',
    accent: 'green',
  },
];
