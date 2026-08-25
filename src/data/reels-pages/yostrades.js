import { YostradesTranscriptOverrides } from '../reels-transcripts/yostrades.js';

const profileUrl = 'https://www.facebook.com/profile.php?id=61590091542659&sk=reels_tab';
const sourceNote = 'Aside 로그인 Facebook 릴스 탭·고유 URL 36개 대조와 yt-dlp 원본 메타데이터·자막·로컬 전사 확인';

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
  publishedRange: '2026.05.25–2026.08.20',
  reelCount: 36,
  totalDuration: '00시간 17분 49초',
  methodology: [
    'Aside 로그인 세션에서 릴스 탭을 끝까지 스크롤해 고유 Reel ID 36개를 수집했다.',
    '각 원본의 자동 자막을 우선 확보하고, 자막이 없으면 오디오를 내려받아 Whisper large-v3-turbo로 로컬 전사했다.',
    '영상별 대표 프레임 콘택트시트와 전사를 대조해 FMC·승률·prop firm 주장, 실행 문장과 누락된 위험 규칙을 분리했다.',
    { id: '2214930402684148', sourceUrl: 'https://www.facebook.com/reel/2214930402684148/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 2214930402684148', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1713451306226638', sourceUrl: 'https://www.facebook.com/reel/1713451306226638/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1713451306226638', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '888570147020851', sourceUrl: 'https://www.facebook.com/reel/888570147020851/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 888570147020851', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1296067042606733', sourceUrl: 'https://www.facebook.com/reel/1296067042606733/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1296067042606733', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1753943062260416', sourceUrl: 'https://www.facebook.com/reel/1753943062260416/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1753943062260416', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '981355461447363', sourceUrl: 'https://www.facebook.com/reel/981355461447363/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 981355461447363', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1727649728676949', sourceUrl: 'https://www.facebook.com/reel/1727649728676949/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1727649728676949', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '986784827591661', sourceUrl: 'https://www.facebook.com/reel/986784827591661/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 986784827591661', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '994886953525331', sourceUrl: 'https://www.facebook.com/reel/994886953525331/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 994886953525331', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1359486426089558', sourceUrl: 'https://www.facebook.com/reel/1359486426089558/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1359486426089558', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1678979153377235', sourceUrl: 'https://www.facebook.com/reel/1678979153377235/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1678979153377235', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '2254911868693178', sourceUrl: 'https://www.facebook.com/reel/2254911868693178/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 2254911868693178', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '4585483024924922', sourceUrl: 'https://www.facebook.com/reel/4585483024924922/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 4585483024924922', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1655250732412935', sourceUrl: 'https://www.facebook.com/reel/1655250732412935/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1655250732412935', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '2013345066237930', sourceUrl: 'https://www.facebook.com/reel/2013345066237930/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 2013345066237930', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '2077555146439641', sourceUrl: 'https://www.facebook.com/reel/2077555146439641/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 2077555146439641', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '977270298424254', sourceUrl: 'https://www.facebook.com/reel/977270298424254/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 977270298424254', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1993926621483794', sourceUrl: 'https://www.facebook.com/reel/1993926621483794/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1993926621483794', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1630599694834681', sourceUrl: 'https://www.facebook.com/reel/1630599694834681/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1630599694834681', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '928083553596035', sourceUrl: 'https://www.facebook.com/reel/928083553596035/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 928083553596035', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '3088287714690253', sourceUrl: 'https://www.facebook.com/reel/3088287714690253/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 3088287714690253', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1887830398600126', sourceUrl: 'https://www.facebook.com/reel/1887830398600126/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1887830398600126', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '990461237060865', sourceUrl: 'https://www.facebook.com/reel/990461237060865/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 990461237060865', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1519394132917529', sourceUrl: 'https://www.facebook.com/reel/1519394132917529/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1519394132917529', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '1339243614857536', sourceUrl: 'https://www.facebook.com/reel/1339243614857536/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 1339243614857536', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
    { id: '826268436900215', sourceUrl: 'https://www.facebook.com/reel/826268436900215/', date: '2026.08.25', duration: '00:00', title: '공개 Reels 탭 추가 확인 영상', originalTitle: 'Facebook Reel 826268436900215', kind: 'commentary', verdict: '검증 필요', fidelity: 'Aside 인증 세션에서 Reels 탭 끝까지 스크롤해 고유 URL 확인', tags: ['additional-audit'], core: '채널의 끝까지 스크롤한 공개 릴스 고유 ID를 연구 목록에 추가하고 원문 분석 대상으로 등록했다.', rules: ['원문 영상·캡션·전사를 확보해 주장과 실행 규칙을 분리한다.', '성과 주장은 독립 원장과 비용 후 표본으로 검증한다.'], caution: '현재는 고유 URL와 존재만 확인했으며 영상별 세부 주장은 원문 콘텐츠 확인 전 확정하지 않는다.' },
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

yostradesResearch.reels = [
  ...yostradesResearch.reels,
  ...yostradesResearch.methodology.filter((item) => item && typeof item === 'object' && item.id),
];
yostradesResearch.methodology = yostradesResearch.methodology.filter((item) => (
  !(item && typeof item === 'object' && item.id)
));
yostradesResearch.reelCount = yostradesResearch.reels.length;
yostradesResearch.reels = yostradesResearch.reels.map((reel) => ({
  ...reel,
  ...(YostradesTranscriptOverrides.get(String(reel.id)) ?? {}),
}));
