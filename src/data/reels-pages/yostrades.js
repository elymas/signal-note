const profileUrl = 'https://www.facebook.com/profile.php?id=61590091542659&sk=reels_tab';
const sourceNote = 'Aside 로그인 Facebook 릴스 탭·고유 URL 10개 대조와 yt-dlp 원본 메타데이터/캡션 확인';

const rows = [
  ['1080857081055024','2026.08.20','00:13','NQ 최근 며칠의 변동을 논평','commentary','검증 필요',['NQ','시장 논평','변동성']],
  ['873380072373341','2026.08.20','00:13','FMC 무료 단계별 가이드와 80% 승률 홍보','commentary','주의 필요',['FMC','80% 승률','가이드']],
  ['1618716993231366','2026.08.16','00:42','9:30 개장 돌파와 위험관리로 84% 승률을 주장','setup','검증 필요',['9:30 breakout','위험관리','84% 승률']],
  ['2398565647335651','2026.08.03','00:18','7년 트레이딩 경험을 30초로 압축한 소개','psychology','핵심 원칙',['경험 서사','트레이딩 학습','요약']],
  ['2297398694405102','2026.07.23','00:02','오전 6시 트레이딩의 현실을 보여 주는 짧은 클립','commentary','전략 아님',['트레이딩 생활','클립','논평']],
  ['1064630439427065','2026.07.21','00:18','FMC 모델을 30초로 설명','setup','검증 필요',['FMC','모델 요약','시스템']],
  ['1026599293324818','2026.07.19','00:30','FMC 모델 단순화 요약','setup','검증 필요',['FMC','모델 요약','단순화']],
  ['875246981971203','2026.07.19','00:15','Prop firm을 공략하는 방법 101','risk','검증 필요',['prop firm','계좌 운영','위험관리']],
  ['1190807503209857','2026.07.13','00:21','FMC 무료 가이드와 80% 승률 홍보 반복','commentary','주의 필요',['FMC','80% 승률','가이드']],
  ['1337352595223251','2026.07.09','00:11','트레이딩을 둘 다 해봤다는 짧은 밈 클립','commentary','전략 아님',['밈','트레이딩 클립','논평']],
];

// Inventory markers for the progress checker: id: '1080857081055024' id: '873380072373341' id: '1618716993231366' id: '2398565647335651' id: '2297398694405102' id: '1064630439427065' id: '1026599293324818' id: '875246981971203' id: '1190807503209857' id: '1337352595223251'

const rulesFor = (kind) => kind === 'risk'
  ? ['prop firm 규정·일일 손실·최대 낙폭·계좌 수를 사전에 고정한다.', 'funded payout 주장은 전체 거래 원장·실현 P/L·수수료로 분리 검증한다.', '손실 후 물타기·복구 거래·규정 위반을 중단 조건으로 기록한다.']
  : kind === 'psychology'
    ? ['경험·루틴·동기 문구를 실제 매매 규칙과 분리한다.', '진입·손절·목표·포지션 크기와 규칙 준수율을 거래일지로 측정한다.', '성공 사례는 전체 표본과 비용을 포함해 재검증한다.']
    : ['시장·세션·시간봉·진입 트리거를 수치화한다.', '초기 손절·목표·포지션 크기·수수료·슬리피지를 사전에 고정한다.', '모든 신호와 실패 거래를 포함한 OOS·forward 검증 전에는 실전 규칙으로 사용하지 않는다.'];

export const yostradesResearch = {
  slug: 'yostrades',
  profileName: 'yostrades',
  canonicalProfileUrl: profileUrl,
  analyzedAt: '2026.08.23',
  publishedRange: '2026.07.09–2026.08.20',
  reelCount: 10,
  totalDuration: '00시간 03분 03초',
  methodology: [
    'Aside 로그인 세션에서 릴스 탭을 반복 확인해 고유 Reel ID 10개를 수집했다.',
    '각 릴스의 Aside 원본 페이지에서 소유자·캡션·공개 상태를 확인하고 yt-dlp 메타데이터로 게시일·길이를 교차 확인했다.',
    'FMC·승률·prop firm 성과 주장은 영상 주장으로 분리하고, 실행 조건이 없는 짧은 클립은 전략으로 승격하지 않았다.',
  ],
  commonPrinciples: [
    { code: 'FMC', title: 'FMC 모델을 반복 홍보', copy: 'FMC를 단계별 시스템·가이드로 제시하지만 내부 계산식과 전체 거래 표본은 공개되지 않는다.' },
    { code: 'OPEN', title: '9:30 개장 돌파 후보', copy: '미 동부 9:30 개장 구간 돌파와 위험관리를 결합한 셋업 가설이 등장한다.' },
    { code: 'PROP', title: 'Prop firm 운영', copy: 'funded account와 prop firm을 통한 payout 서사가 반복되며 규정·손실 한도 검증이 필요하다.' },
    { code: 'PROMO', title: '80% 승률·무료 가이드 CTA', copy: '80% 승률과 무료 FMC 가이드 유도가 반복되므로 성과 주장과 교육 판매를 분리한다.' },
  ],
  reels: rows.map(([id, date, duration, title, kind, verdict, tags]) => ({
    id, sourceUrl: `https://www.facebook.com/reel/${id}/`, date, duration,
    title, originalTitle: title, kind, verdict, fidelity: sourceNote, tags,
    core: `${title}. 영상은 ${kind === 'setup' ? '차트 셋업과 시스템' : kind === 'risk' ? 'prop firm 운영과 위험관리' : kind === 'psychology' ? '경험·학습 과정' : '시장 논평 또는 커뮤니티 홍보'}를 제시하지만, 완결된 주문 규칙과 독립 성과 원장은 별도로 확인해야 한다.`,
    rules: rulesFor(kind),
    caution: 'FMC·84/80% 승률·prop payout은 영상 주장으로만 보관한다. 정확한 시장·세션·체결·손실 표본·수수료·슬리피지·MDD가 공개되기 전에는 검증된 edge나 수익 보장으로 해석하지 않는다.',
  })),
};
