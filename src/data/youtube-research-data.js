import {
  hiddenRichesAudit,
  hiddenRichesVideos,
  videoPatterns as stockVideoPatterns,
} from './hidden-riches-video-data.js';

const cryptoVideoPatterns = {
  signal: {
    label: 'SIGNAL · 비공개 로직',
    setup: '롱·숏·TP 신호의 계산식, 확정 시점, 리페인팅 여부를 먼저 확인합니다. 화면에 찍힌 화살표만으로는 재현 가능한 전략이 아닙니다.',
    entry: '코드를 확보해 봉 마감 뒤에도 신호가 유지되는지 확인하고, 거래비용을 포함한 충분한 표본의 전진 검증 전에는 실거래하지 않습니다.',
    exit: '1차 TP에서 일부 청산하고 손절을 본전으로 옮기는 규칙은 별도로 검증합니다. 반대 신호가 손절을 대신한다면 최대 손실 폭을 사전에 제한합니다.',
  },
  openFvg: {
    label: 'OPEN · 개장구간+FVG',
    setup: '미 동부 09:30 첫 5분봉의 고가·저가를 기준으로 삼고, 1분봉 종가 돌파와 FVG 형성을 함께 기다립니다.',
    entry: '기준 구간 돌파 직후 추격하지 않고 FVG 되돌림 또는 돌파선 재지지를 확인해 하루 한 번만 접근합니다.',
    exit: '직전 스윙이나 기준 구간 반대편을 무효화선으로 두고, 사전에 정한 1R~3R에서 분할 청산합니다.',
  },
  vwap: {
    label: 'VWAP · 거래량 평균가',
    setup: '가격과 거래량을 반영한 앵커드 VWAP 위·아래 위치와 선의 방향 전환을 추세 필터로 사용합니다.',
    entry: '봉 마감 후 VWAP 위 안착은 롱, 아래 안착은 숏 후보로 보되 선을 걸친 횡보 구간은 건너뜁니다.',
    exit: '최근 스윙 바깥에 손절을 두고 최소 1:3 손익비를 요구합니다. 반대 전환 신호는 청산 또는 재평가 조건입니다.',
  },
  ict: {
    label: 'ICT · 유동성 회수',
    setup: '최근 의미 있는 스윙 고점 또는 저점 하나를 정하고, 꼬리 터치가 아니라 종가 기준 이탈 여부를 봅니다.',
    entry: '유동성 구간을 종가로 넘긴 다음 캔들이 다시 범위 안으로 복귀 마감할 때만 반대 방향 진입을 검토합니다.',
    exit: '스윕 극값 바깥을 무효화선으로 사용하고 다음 유동성 구간이나 사전 손익비에서 청산합니다.',
  },
  confluence: {
    label: 'STACK · 다중지표 합류',
    setup: '장기 이동평균 위치, 단기 이평 교차, MACD 방향, RSI 과열 여부처럼 서로 다른 조건이 동시에 맞는 구간만 봅니다.',
    entry: '모든 조건이 봉 마감으로 확정될 때만 진입하고 하나라도 빠지면 거래하지 않습니다.',
    exit: '고정 손절과 일중 청산 원칙을 먼저 두고, 반대 교차 또는 목표 손익비에서 포지션을 종료합니다.',
  },
  trendSignal: {
    label: 'TREND · 중심선 돌파',
    setup: '중심선의 방향·색과 가격의 상하 위치로 추세를 정의하고, 거래량 또는 보조 신호가 붙는 돌파를 봅니다.',
    entry: '중심선 위 종가와 상승 전환은 롱, 아래 종가와 하락 전환은 숏 후보로 삼되 횡보 구간의 잦은 전환은 제외합니다.',
    exit: 'TP·반대 신호 또는 중심선 재이탈에 청산합니다. 신호가 사라지는지와 실시간 확정 시점을 반드시 검증합니다.',
  },
  tdSequential: {
    label: 'TD · 13-9 카운트',
    setup: 'TD 지지·저항선 전환으로 방향을 정하고 9·13 카운트는 추세 소진 후보로만 해석합니다.',
    entry: '저항선이 지지선으로 바뀌면 롱, 지지선이 저항선으로 바뀌면 숏을 검토하되 전환이 봉 마감 뒤 확정되는지 봅니다.',
    exit: '9 또는 13 소진 신호와 구조 무효화 중 먼저 온 조건을 사용합니다. 숫자 자체를 반전 보장으로 해석하지 않습니다.',
  },
  methodBundle: {
    label: 'BUNDLE · 전략 모음',
    setup: '한 영상에 묶인 SEPA 돌파, 추세·지지저항, 비공개 진입/청산 신호를 각각 독립 전략으로 분리합니다.',
    entry: '전략별 시장·시간봉·진입 조건을 섞지 않고 각각 사전 정의한 뒤 같은 기간의 전체 신호를 검증합니다.',
    exit: '각 전략의 원래 청산 조건과 손절을 따로 기록하고, 편집된 성공 사례의 합산 수익률은 사용하지 않습니다.',
  },
  indicatorQuiz: {
    label: 'QUIZ · 단일 차트 사례',
    setup: '공개 지표 하나의 겉보기 방향과 채널의 비공개 신호를 한 구간에서 대조한 20초대 퀴즈입니다.',
    entry: '정답 공개 뒤 해당 구간에 맞춰 진입하지 않습니다. 지표 공식·파라미터·시장·시간봉을 고정한 전체 표본이 필요합니다.',
    exit: '영상에는 일관된 손절·익절 규칙이 없으므로 실전 청산 규칙으로 전환하지 않습니다.',
  },
};

export const youtubeVideoPatterns = {
  ...stockVideoPatterns,
  ...cryptoVideoPatterns,
};

const C = (id, date, duration, kind, pattern, theme, subject, title, thesis, claims, risk, transcriptSource = '자동자막') => ({
  id,
  date,
  duration,
  kind,
  pattern,
  theme,
  subject,
  title,
  thesis,
  claims,
  risk,
  transcriptSource,
  url: `https://www.youtube.com/watch?v=${id}`,
});

// 제목·설명·한국어 자막(1편은 원본 오디오 전사)을 대조해 작성했습니다.
// claims는 채널의 성과 주장이지 독립 검증 결과가 아닙니다.
export const tenBillionTraderVideos = [
  C('2VZajADjQes', '2026.07.26', '00:48', '전략 요약', 'signal', '비공개 신호지표', '패트릭 닐 시그널', '롱·숏·TP 세 신호로 단순화한 단타 시스템', '진입보다 조건을 기다리고 별도 TP 신호로 청산하는 구조를 1분 안에 요약한다.', '유료 강의의 시그널을 며칠간 비트코인에 적용했을 때 높은 승률을 보였다는 영상 주장', '지표 코드·표본·손절 규칙·수수료가 공개되지 않았고 고정 댓글 배포 경로의 조건도 별도 확인해야 한다.'),
  C('WTZFSzTqVZ8', '2026.07.15', '11:14', '전략 검증', 'signal', '비공개 신호지표', '패트릭 닐 시그널', '세계 대회 우승자 강의의 진입·TP 신호 테스트', '좋은 트레이더의 차이는 신호 횟수보다 조건이 올 때까지 기다리는 기준에 있다는 해석으로 유료 지표를 시험한다.', '비트코인 10배 레버리지 사례 7회 중 6회 수익·1회 손실, 개별 표시 수익률 +8~+34%라는 영상 주장', '단일 날짜 주변 사례를 사후 선택했고 지표 산식·손절·슬리피지·청산가 위험이 없어 승률을 일반화할 수 없다.'),
  C('ElhtnQ9bGrw', '2026.07.06', '01:04', '전략 요약', 'openFvg', 'FVG·개장 돌파', '09:30 FVG', '하루 한 번의 개장구간 FVG 전략 예고', '특정 시간·단일 시간봉·한 패턴만 거래해 과잉 매매를 줄이는 아이디어를 짧게 소개한다.', '해외 트레이더가 90일 이내 9천 달러를 13만4천 달러로 늘렸다는 원음과 FVG 지표 배포 안내', '성과의 계좌 원장과 최대낙폭이 없고 한국어 내레이션이 적어 자동자막 대신 원본 오디오를 직접 전사했다.', '원본 오디오 전사'),
  C('orWBADcVdc8', '2026.07.04', '12:05', '전략 검증', 'openFvg', 'FVG·개장 돌파', '캐스퍼 09:30 FVG', '뉴욕 개장 첫 5분 범위와 FVG 되돌림', '미 동부 09:30 첫 5분봉 고저를 표시하고 1분봉 종가 돌파와 FVG가 함께 생긴 뒤 되돌림에서 진입한다.', '2026년 6월 15~21일 50배 가정 백테스트 7회 중 6회 수익·1회 손실, 채널이 소개한 원 트레이더 월 1.5억 원 수익 주장', '7일 표본과 50배 레버리지는 작은 가격 오차·수수료·청산가에 극도로 민감하며 뉴욕 서머타임 변환도 명시해야 한다.'),
  C('2TxJHw_GMtE', '2026.06.27', '01:02', '전략 요약', 'openFvg', '개장구간 돌파', '09:30 첫 캔들 범위', '뉴욕 개장 캔들의 꼬리 범위를 하루 기준선으로 사용', '09:30 개장봉의 위·아래 꼬리를 범위로 정한 뒤 5분봉 종가가 어느 쪽으로 마감하는지로 방향을 확인한다.', '16년 경력 해외 트레이더의 전략을 알림·자동 선으로 구현했다는 영상 주장', '돌파 뒤 진입·손절·청산 세부 조건과 전체 성과가 없고, 한 방향 확인만으로는 가짜 돌파를 걸러낼 수 없다.'),
  C('Mgw5s81x8pk', '2026.06.27', '08:09', '채널 방법론', 'methodBundle', '코인 기술전략', 'VWAP·FVG·ICT', '10억 달성 과정과 세 가지 주력 전략', '채널 운영자가 시드 10억 원까지 사용했다고 설명한 VWAP, 개장 FVG, ICT 유동성 회수 전략을 하나의 입문 지도로 묶는다.', 'VWAP 1시간봉 10배·1:3 손익비 예시 3회 수익, 자체 지표 무료 배포, 2017년 시작해 2026년 5월 시드 10억 달성 주장', '자산·거래 내역은 독립 검증되지 않았고 세 전략의 적용 시장과 표본이 섞여 있어 각각 별도 백테스트해야 한다.'),
  C('sV5QHcBKEa0', '2026.06.26', '00:48', '전략 요약', 'openFvg', 'FVG·개장 돌파', 'FVG 되돌림 진입', '기준선 몸통 돌파 뒤 FVG 재진입을 기다리는 순서', '뉴욕 개장 첫 캔들 범위를 몸통으로 돌파하고 FVG가 생긴 뒤 가격이 그 구간으로 되돌아올 때 진입한다.', '직전 캔들 저점 손절·1:1 손익비·10배 레버리지 기준 +10% 사례와 자동 알림 지표 배포 주장', '한 번의 성공 장면이며 FVG 정의, 숏 손절 위치, 수수료와 미체결 가능성이 생략됐다.'),
  C('yh_wNyOFn4E', '2026.06.22', '13:41', '전략 검증', 'vwap', '앵커드 VWAP', '거래량 가중 평균가', 'VWAP 방향 전환과 1:3 손익비를 결합한 추세 매매', '거래량까지 반영한 평균 단가 위·아래를 시장 참여자의 손익 상태로 해석하고 색 전환과 봉 위치로 롱·숏을 고른다.', '2026년 1월 비트코인 10배 가정 10회 중 9회 수익·1회 손실, 총 +270%와 −10%라는 영상 주장', '앵커 기준과 색 전환 산식이 공개되지 않았고 10배 레버리지·사후 구간 선택·거래비용을 반영하지 않았다.'),
  C('n5qQi3aXoeo', '2026.06.21', '00:50', '전략 요약', 'vwap', '앵커드 VWAP', 'VWAP 색 전환', '가격과 거래량을 함께 보는 평균가 신호', 'VWAP이 빨강에서 초록으로 바뀌면 롱, 초록에서 빨강으로 바뀌면 숏이라는 채널의 단순 규칙을 압축한다.', '해외 트레이더의 손실 회복 서사와 채널이 반년간 보완·백테스트한 지표 무료 제공 주장', '앵커·시간봉·손절이 없고 인물 서사와 지표 성과가 독립 검증되지 않아 진입 규칙으로 바로 쓸 수 없다.'),
];

const quizRisk = '선택된 단일 차트 사례일 뿐이며 비공개 신호의 공식·파라미터·확정 시점·리페인팅·전체 표본·거래비용이 공개되지 않았다.';
const Q = (id, date, duration, indicator, visibleSignal, channelCall) => C(
  id,
  date,
  duration,
  '지표 퀴즈',
  'indicatorQuiz',
  '단일 지표 퀴즈',
  indicator,
  `${indicator}와 비공개 신호의 방향 대조`,
  `${visibleSignal}만 보고 방향을 단정하지 말자는 5초 차트 퀴즈다.`,
  `화면 사례에서 채널의 비공개 신호가 ${channelCall}을 예고해 적중했으며 지표 승률이 86%라고 주장한다.`,
  quizRisk,
);

export const tradingStandardVideos = [
  C('zzCts9RdS9w', '2026.08.06', '04:07', '전략 검증', 'signal', '비공개 신호지표', '롱·숏·TP 통합지표', '1TP 분할과 2TP 추세 보유를 결합한 신호 전략', '진입 신호 뒤 1TP에서 절반을 익절하고 손절을 본전으로 올린 다음 2TP에서 잔여 물량을 정리하는 두 단계 청산을 제시한다.', '3분봉 3손실, 15분봉 5회 수익, 30분·1시간·2시간봉의 선택 구간 성과와 23페이지 전략집 무료 제공 주장', '서로 다른 시간봉의 유리한 구간을 나열했고 코드·검증 기간·포지션 크기·비용이 없어 성과를 비교할 수 없다.'),
  C('dSittyrTCMU', '2026.06.21', '04:01', '전략 검증', 'signal', '비공개 신호지표', '진입·X 청산 신호', '1년 사용했다는 비공개 롱·숏·청산 지표', '초록·빨강 원형 신호로 진입하고 같은 색 X 신호에서 전량 또는 일부 청산하는 단순 로직을 제시한다.', '최근 3개월 거래 내역과 구독자 사례, 15분~4시간봉 실시간 차트에서 다수 익절·본전 거래라는 영상 주장', '거래 내역 원자료·손실 거래·지표 산식이 공개되지 않았고 “같은 신호라도 결과가 다르다”는 설명은 재현성을 약화한다.'),
  C('l9byAYOUe7E', '2025.09.07', '33:00', '전략 모음', 'methodBundle', '전략 모음', 'SEPA·추세·비공개 신호·제레미', '네 가지 기존 전략을 한 편으로 묶은 복습본', 'SEPA 중심선 돌파, 통합 이동평균 추세·지지저항, 유료 진입/청산 신호, 다빈치 제레미형 신호를 순서대로 재편집했다.', '각 원본에서 제시한 단기 사례 수익과 “매달 1억”이라는 묶음 제목의 성과 주장', '서로 다른 전략·시장·기간을 합친 편집본이라 합산 성과로 볼 수 없고 중복 원본과 독립된 새 검증도 아니다.'),
  C('70xYFNwBEqs', '2025.07.16', '04:46', '전략 검증', 'confluence', '다중지표 합류', '마틴 슈워츠 4조건', '200이평·10/20 교차·MACD·RSI 합류 전략', '200이평으로 장기 방향을 제한하고 단기 이평과 MACD 교차, RSI 비과열 조건이 모두 맞을 때만 진입한다.', '50배 레버리지·7일간 하루 1회 시뮬레이션에서 7회 중 6회 수익·1회 손실, 총 +320%라는 영상 주장', '50배 가정은 청산·수수료 민감도가 매우 높고 마틴 슈워츠의 원전 규칙과 채널 통합지표가 같은지 확인되지 않았다.'),
  C('P02kvcLA2uk', '2025.07.02', '07:41', '전략 검증', 'signal', '추세 신호지표', '빅토리아 듀크 추세신호', '롱·숏 전환과 X 청산으로 추세를 따라가는 전략', '방향 신호에서 포지션을 전환하고 X 신호를 청산 후보로 쓰되 수익이 작으면 신호를 무시하고 더 보유하는 실전 장면을 보여준다.', '3분봉 5시간 3회 중 2회 수익·1회 손실로 +30%, 1시간봉 선택 사례 4회 +68.5~+196%라는 영상 주장', '제목·설명에서 인물명이 불일치하고 청산 신호를 재량으로 무시해 규칙이 사후 변경됐으며 레버리지·비용이 불명확하다.'),
  C('aXt2wWX2Ttw', '2025.06.18', '11:04', '전략 검증', 'signal', '추세 신호지표', '다빈치 제레미 신호', '지지·저항 밴드의 전구·밴드 신호로 전환 매매', '초록 지지선 아래 전구는 롱, 빨간 저항선 위 밴드는 숏으로 해석하고 반대/청산 신호에서 포지션을 바꾼다.', '이틀 5회 중 4회 수익·1회 −0.75%, 합산 약 +50%와 350만 원 수익이라는 영상 주장', '수익이 낮은 첫 청산 신호를 건너뛰고 놓친 거래의 가상 수익을 포함했으며 성공한 전략만 영상화한다고 밝혀 선택 편향이 크다.'),
  C('NpX0xqfbcZI', '2025.06.09', '07:21', '전략 검증', 'trendSignal', 'SEPA·돌파', '마크 미너비니 SEPA 변형', '중심선 돌파와 거래량 TP로 만든 코인 단타 변형', '중심선 위·아래 돌파와 색 전환으로 방향을 정하고 거래량 기반 TP 신호에서 청산한다.', '비트코인 3분봉 실거래 3시간 30분 동안 약 300만 원 수익과 사전 3일 테스트라는 영상 주장', '원래 SEPA는 주식의 추세 템플릿·펀더멘털 선별을 포함하는데 영상은 비공개 중심선 단타로 축약했고 전체 사전 테스트가 없다.'),
  C('24nhp3KOkhA', '2025.05.01', '07:17', '전략 검증', 'tdSequential', 'TD 13-9', 'TD 지지·저항과 소진 카운트', '지지·저항선 전환으로 진입하고 9·13에서 청산하는 전략', 'TD 라인의 색 전환으로 방향을 잡고 9·13 카운트를 추세 약화와 청산 신호로 사용한다.', '이더리움 1분봉 실거래 2회와 다음 날 차트의 가상 2회를 합쳐 4회 모두 수익·총 542만 원이라는 영상 주장', '실거래와 사후 가정 거래를 합산했고 4회뿐이며 TD Sequential의 공식 카운트와 채널 지표 구현 일치 여부가 불명확하다.'),
  C('CBwjjPrN_G0', '2025.04.17', '07:24', '전략 검증', 'trendSignal', 'SEPA·돌파', 'SEPA 중심선·거래량 TP', '돌파 방향과 거래량 청산 신호를 실시간 차트에서 시험', '중심선 돌파와 색 전환에서 진입하고 거래량 기반 TP 신호에서 전량 청산한다.', '비트코인 실거래 2회 수익과 잠든 뒤 차트의 가상 2회를 합쳐 약 640만 원 수익이라는 영상 주장', 'TP 신호가 실시간에 깜빡이며 사라졌다고 밝혀 리페인팅 가능성이 있고 가상 거래를 실적에 포함했다.'),
  C('mo8jNjMZgcQ', '2025.04.04', '07:06', '채널 방법론', 'trendSignal', '추세·지지저항', '통합 이동평균 신호', '추세·지지저항·진입 타점을 하나의 비공개 선으로 통합', '선의 색과 가격 위치로 상승·횡보·하락을 구분하고 선의 지지·저항과 같은 방향 신호를 진입에 사용한다.', '비트코인 5분봉 +10% 사례, 알트코인 일봉 10일 +24% 가상 사례, 이 지표로 대출 3억 원을 갚았다는 영상 주장', '최적 이동평균 산식과 200개 캔들 가중 방식이 공개되지 않았고 재량 파라미터 변경은 과최적화 위험을 키운다.'),
  C('axj8r7or8m4', '2025.02.27', '07:25', '전략 검증', 'signal', '비공개 신호지표', '유료 롱·숏·X 지표', '유료 신호지표를 여러 시간봉에서 사후 검증', '원형 롱·숏 신호에서 진입하고 X 신호에서 일부 또는 전량 청산하며 반대 진입 신호에는 본전 전환을 적용한다.', '5분~4시간봉 선택 구간에서 본전 제외 승률 80~100%, 한 번도 손절이 없었다는 영상 주장', '후행 차트 눈대중 검증이고 본전 거래를 승률 분모에서 제외했으며 개발자 저작권·배포 경로와 이해관계도 확인이 필요하다.'),

  Q('QLda9RJPnsI', '2025.06.27', '00:24', 'Relative Vigor Index', 'RVI 상승', '하락'),
  Q('viNqWPoZ2iM', '2025.06.27', '00:24', 'Connors RSI', 'Connors RSI 상승', '하락'),
  Q('X_oxVmXah98', '2025.06.26', '00:24', 'Donchian Width', 'Donchian Width 하락', '상승'),
  Q('XEBTzPc69_s', '2025.06.26', '00:24', 'Bollinger Band Width', '밴드 폭 하락', '상승'),
  Q('9XPeYOjEmMw', '2025.06.25', '00:23', 'Know Sure Thing', 'KST 상승', '상승'),
  Q('Knm1XVuG0Gg', '2025.06.25', '00:25', 'Elder Impulse System', 'Elder Impulse 상승', '하락'),
  Q('BszwrNGmDm4', '2025.06.24', '00:27', 'SMA 50', '가격이 SMA 50 아래', '상승'),
  Q('zIq92s1v_wc', '2025.06.24', '00:26', 'Detrended Price Oscillator', 'DPO 음전환', '상승'),
  Q('BvFRCm23c20', '2025.06.11', '00:24', 'Fractal Chaos Bands', '밴드 상승', '하락'),
  Q('dM31mrzLTWs', '2025.06.11', '00:24', 'Hull Moving Average', 'HMA 하락', '상승'),
  Q('FMeAhY5hV4k', '2025.06.11', '00:24', 'Detrended Price Oscillator', 'DPO 음전환', '하락'),
  Q('GYixBpxRnJY', '2025.06.11', '00:24', 'TEMA', 'TEMA 상승', '하락'),
  Q('p_nxjLuxTXo', '2025.06.11', '00:24', 'ZLEMA', 'ZLEMA 하락', '상승'),
  Q('pDqNeqIm1_s', '2025.06.11', '00:24', 'Chande Momentum Oscillator', 'CMO 상승', '하락'),
  Q('vWN4JP4OaKc', '2025.06.11', '00:24', 'DEMA', 'DEMA 상승', '하락'),
  Q('yUUa4Aygptc', '2025.06.11', '00:25', 'SMA 50', '가격이 SMA 50 아래', '상승'),
  Q('0bKENGLciws', '2025.06.09', '00:24', 'Stochastic Momentum Index', 'SMI 상승', '하락'),
  Q('2PwmO6VZz_I', '2025.06.09', '00:23', 'Williams %R', '과매도', '하락'),
  Q('PvYatkiThLM', '2025.06.09', '00:24', 'Price Oscillator', '오실레이터 상승', '하락'),
  Q('t2L82IJwieI', '2025.06.09', '00:24', 'ZigZag', 'ZigZag 상승', '하락'),
  Q('WW4emOcF7tM', '2025.06.09', '00:23', 'Schaff Trend Cycle', 'STC 하락', '상승'),
  Q('Xk-L4RrpCg0', '2025.06.09', '00:22', 'Coppock Curve', 'Coppock 하락', '상승'),
  Q('1yoTVKHkJ8g', '2025.06.06', '00:25', 'PPO', 'PPO 데드크로스', '상승'),
  Q('2v6K3n6kd8c', '2025.06.06', '00:24', 'Fractal', '상단 돌파', '하락'),
  Q('J_aKbWu-Sd0', '2025.06.06', '00:25', 'TRIX', 'TRIX 상승', '하락'),
  Q('rjqAyA_ztY4', '2025.06.06', '00:25', 'KDJ', 'KDJ 골든크로스', '하락'),
  Q('vXhWC3nUt3k', '2025.06.06', '00:24', 'Ehlers Fisher Transform', 'Fisher Transform 하락', '상승'),
  Q('Y7PYYA6ZxqM', '2025.06.06', '00:23', 'Envelope', '하단 터치', '하락'),
  Q('10R1rEQq938', '2025.06.05', '00:25', 'Bollinger Bands', '하단 밴드 터치', '하락'),
  Q('9vpZQZJKjoM', '2025.06.05', '00:24', 'EMA', '골든크로스', '하락'),
  Q('bjlqx7LoYQA', '2025.06.05', '00:23', 'Money Flow Index', 'MFI 과매수', '상승'),
  Q('cfZsQrxAY48', '2025.06.05', '00:23', 'MACD', 'MACD 골든크로스', '하락'),
  Q('D3LIYaMTMAA', '2025.06.05', '00:24', 'Parabolic SAR', 'SAR 점이 가격 아래', '하락'),
  Q('nvXu2OzVeIo', '2025.06.05', '00:24', 'Supertrend', 'Supertrend 녹색', '하락'),
  Q('P3fsYAdnILw', '2025.06.05', '00:24', 'Ultimate Oscillator', '과매수', '하락'),
  Q('p4hdDbw8lrU', '2025.06.05', '00:24', 'EMA 200', 'EMA 200 지지', '하락'),
  Q('r6MyFaopQIg', '2025.06.05', '00:25', 'OBV', 'OBV 상승', '하락'),
  Q('rNzGECkcs5I', '2025.06.05', '00:24', 'CCI', 'CCI −100 이하', '하락'),
  Q('SG4OIVhFbWQ', '2025.06.05', '00:24', 'Stochastic', '과매수', '상승'),
  Q('WsVX2hEb8Es', '2025.05.24', '00:28', '삼각수렴', '삼각수렴 완성', '상승'),
  Q('0Z0Cr2Sh6Ok', '2025.05.23', '00:31', 'M 패턴', 'M 패턴과 저항', '상승'),
  Q('Ggwi-sgUS2o', '2025.05.23', '00:29', '망치형 캔들', '상승형 망치 캔들', '하락'),
  Q('1y00KBpLsdE', '2025.05.22', '00:28', 'RSI', 'RSI 과매수', '상승'),
  Q('NsK6t8NRAz0', '2025.05.22', '00:28', '추세선', '상승 추세선', '하락'),
];

export const youtubeResearchChannels = [
  {
    id: 'UC9u1oiGsAYwk6OKgfR5jRkA',
    slug: 'hidden-riches',
    name: '주식해서한강뷰삼촌',
    url: 'https://www.youtube.com/channel/UC9u1oiGsAYwk6OKgfR5jRkA',
    ...hiddenRichesAudit,
    autoCaptioned: 86,
    audioTranscribed: 0,
    dateRange: '2026.05.06–2026.08.07',
    note: '채널 표기 87편 중 공개 목록 86편을 전수 분석했습니다. 공개 목록에 없는 1편은 비공개·삭제·예약·집계 지연 여부를 외부에서 확정할 수 없습니다.',
  },
  {
    id: 'UC9kFKSIHmlyWfFqyYeOar8A',
    slug: 'ten-billion-trader',
    name: '10억만든 일반인',
    url: 'https://youtube.com/channel/UC9kFKSIHmlyWfFqyYeOar8A',
    channelReported: 9,
    publicVideos: 9,
    longForm: 4,
    shorts: 5,
    captioned: 9,
    autoCaptioned: 8,
    audioTranscribed: 1,
    unavailableGap: 0,
    auditedAt: '2026.08.11',
    dateRange: '2026.06.21–2026.07.26',
    note: 'Videos 4편과 Shorts 5편 모두 공개 접근·원본 재생을 확인했습니다. 자동자막 8편과 원본 오디오 직접 전사 1편으로 전편 본문을 분석했습니다.',
  },
  {
    id: 'UCfLFVwP_R59aflHl4hBji3Q',
    slug: 'trading-standard',
    name: '매매의정석',
    url: 'https://youtube.com/channel/UCfLFVwP_R59aflHl4hBji3Q',
    channelReported: 55,
    publicVideos: 55,
    longForm: 11,
    shorts: 44,
    captioned: 55,
    autoCaptioned: 55,
    audioTranscribed: 0,
    unavailableGap: 0,
    auditedAt: '2026.08.11',
    dateRange: '2025.02.27–2026.08.06',
    note: 'Videos 11편과 Shorts 44편 모두 공개 접근·원본 재생·한국어 자동자막을 확인해 제목·설명·자막을 대조했습니다.',
  },
];

const attachChannel = (videos, channel) => videos.map((video) => ({
  ...video,
  channelId: channel.id,
  channelSlug: channel.slug,
  channelName: channel.name,
}));

export const youtubeResearchVideos = youtubeResearchChannels.flatMap((channel) => {
  if (channel.slug === 'hidden-riches') {
    return attachChannel(hiddenRichesVideos.map((video) => ({ ...video, transcriptSource: '자동자막' })), channel);
  }
  if (channel.slug === 'ten-billion-trader') return attachChannel(tenBillionTraderVideos, channel);
  return attachChannel(tradingStandardVideos, channel);
});

export const youtubeResearchAudit = {
  channelReported: youtubeResearchChannels.reduce((sum, channel) => sum + channel.channelReported, 0),
  publicVideos: youtubeResearchChannels.reduce((sum, channel) => sum + channel.publicVideos, 0),
  longForm: youtubeResearchChannels.reduce((sum, channel) => sum + channel.longForm, 0),
  shorts: youtubeResearchChannels.reduce((sum, channel) => sum + channel.shorts, 0),
  captioned: youtubeResearchChannels.reduce((sum, channel) => sum + channel.captioned, 0),
  unavailableGap: youtubeResearchChannels.reduce((sum, channel) => sum + channel.unavailableGap, 0),
  auditedAt: '2026.08.11',
  note: '3개 채널의 공개 영상 150편을 모두 분석했습니다. 로그인·연령·멤버십 제한으로 불완전한 분석은 0편이며, 기존 채널의 공개 목록 밖 1편만 미확인 상태입니다.',
};

export const youtubeVideoKinds = ['전체', ...Array.from(new Set(youtubeResearchVideos.map((video) => video.kind)))];
export const youtubeVideoThemes = ['전체', ...Array.from(new Set(youtubeResearchVideos.map((video) => video.theme))).sort((a, b) => a.localeCompare(b, 'ko'))];
