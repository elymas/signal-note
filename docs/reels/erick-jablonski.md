# Erick Jablonski Facebook Reels 전수 조사

- 원본 공개 Reels 탭: <https://www.facebook.com/erickjablonski/reels/>
- 분석 기준일: 2026.08.04
- 공개 목록에서 확인한 범위: 2026.07.22–2026.08.02, 10개, 10분 12초

## 전체 열거

| # | 게시일 | 길이 | Reel ID | 원문 캡션/제목 | 분류 | 판정 | 핵심 |
|---:|---|---:|---|---|---|---|---|
| 1 | 2026.08.02 | 01:02 | [1334467928756100](https://www.facebook.com/reel/1334467928756100/) | I finally realized why I struggle to focus on day trading lately... | psychology | 전략 아님 | 부채·콘텐츠 압박으로 트레이딩 집중력과 전략 확신이 흔들린 개인 근황 |
| 2 | 2026.07.31 | 01:06 | [2929608957396096](https://www.facebook.com/reel/2929608957396096/) | How to start day trading for free (actually) | setup | 검증 필요 | 상위 계정 보유 종목의 15분 상승 추세에서 음봉 눌림 고가 돌파, 1R 목표 |
| 3 | 2026.07.29 | 00:47 | [1719345062518582](https://www.facebook.com/reel/1719345062518582/) | 7 months ago I exposed myself for being in 27k of day trading debt | commentary | 전략 아님 | 부채 상환 재원의 대부분이 트레이딩이 아닌 콘텐츠 수입이었다는 손익 공개 |
| 4 | 2026.07.28 | 01:16 | [1308686705652207](https://www.facebook.com/reel/1308686705652207/) | How to day trade based on what the top day traders are doing | setup | 규칙화 가능 | 15분 상승 추세의 음봉 고가 돌파 매수, 음봉 저가 손절, 2R 목표 |
| 5 | 2026.07.28 | 01:25 | [1536346101302648](https://www.facebook.com/reel/1536346101302648/) | How to day trade from your phone for free | risk | 핵심 원칙 | TradingView 모의계좌에서 최소 100회 규칙 준수·성과 확인 후 소액 실전 전환 |
| 6 | 2026.07.27 | 00:57 | [1419952919967968](https://www.facebook.com/reel/1419952919967968/) | Are day traders cooked with mortgages? 😭 | commentary | 전략 아님 | 보상받은 BLNE 마이크로캡 홍보로 진입·손절·목표가 없음 |
| 7 | 2026.07.27 | 00:38 | [1065675785995749](https://www.facebook.com/reel/1065675785995749/) | Learn how to day trade in under 60 seconds | setup | 규칙화 가능 | 15분·1시간·일·주봉 방향 정렬 후 음봉 고가 돌파, 최소 2.5R 목표 |
| 8 | 2026.07.26 | 01:31 | [1735018660873285](https://www.facebook.com/reel/1735018660873285/) | Building a trading bot (explained for 5 year olds) | setup | 검증 필요 | 첫 30분 ORB를 Pine Script·TradingView·TradersPost·프랍 계정으로 자동화 |
| 9 | 2026.07.24 | 00:56 | [888545227663515](https://www.facebook.com/reel/888545227663515/) | MY DEBT IS ALMOST GONE | commentary | 전략 아님 | 브랜드 계약 수입으로 트레이딩 부채를 갚은 콘텐츠 근황 |
| 10 | 2026.07.22 | 00:28 | [2238060103789530](https://www.facebook.com/reel/2238060103789530/) | day trading for 5 year olds 😭 | setup | 규칙화 가능 | 첫 두 15분봉의 고저 범위를 종가로 돌파한 방향 진입, 반대편 손절, 1R 목표 |

## 분석법

1. `erick-reels` agent-browser 세션에서 제공된 공개 Reels 탭을 열었다.
2. DOM의 `/reel/{id}` 앵커를 수집하고 Reel ID로 중복 제거해 공개 URL 10개를 확정했다.
3. yt-dlp로 게시일, 초 단위 길이, 원문 캡션을 확인하고 영상 10개를 전부 다운로드했다.
4. 모든 영상을 `mlx-community/whisper-large-v3-turbo`로 영어 전사했다.
5. 각 영상의 7초 간격 컨택트 시트를 만들어 전사와 자막, FOMO 리더보드, TradingView 주문창, 다중 시간대 차트, ORB 코드·자동화 화면을 교차 확인했다.
6. 진입·무효화·청산 규칙의 재현 정도에 따라 `규칙화 가능`, `검증 필요`, `핵심 원칙`, `전략 아님`으로 구분했다.

## 완전성 검증

- 로그아웃 공개 Reels 탭 DOM에서 노출된 앵커는 10개였고 모두 고유 ID였다.
- DOM 높이는 `633`이었으며 10개 타일 다음에 **“See more on Facebook”** 로그인 유도가 표시됐다.
- 목록 10개, yt-dlp 메타데이터 10개, 다운로드 영상 10개, Whisper 전사 10개, 컨택트 시트 10개를 ID별로 1:1 대조했다.
- 게시일은 yt-dlp의 `upload_date`, 길이는 `duration`을 사용했다. 합계는 611.816초로 반올림해 10분 12초다.
- 공개 목록 순서는 최신 2026.08.02에서 최초 2026.07.22 순이며 yt-dlp 게시일과 일치했다.

## 접근 제한과 해석 주의

- `reelCount: 10`은 2026.08.04에 **로그아웃 공개 Reels 탭이 노출한 전체 10개**를 뜻한다. 로그인한 계정에 더 오래된 영상이 노출될 가능성은 배제할 수 없다.
- 삭제·비공개·지역·연령 제한 영상은 확인할 수 없고 Facebook의 개인화나 실험에 따른 목록 차이도 있을 수 있다.
- FOMO 리더보드 영상은 플랫폼 판촉 문구를 포함한다. 상위 수익 계정과 이미 오른 토큰을 고르는 과정에는 생존자 편향과 사후선택 편향이 있다.
- BLNE 영상은 제3자 에이전시가 제작자에게 보상한 스폰서 콘텐츠임을 캡션에 명시한다. 마이크로캡 종목의 투자 근거로 사용하지 않았다.
- Claude Code 자동매매 영상은 GOAT Funded Futures 할인 링크를 안내한다. 표시된 백테스트와 당일 수익은 코드 정확성이나 전략 기대값의 증거가 아니다.
- “6 payouts”, 트레이딩 순이익, 부채, 브랜드 계약 금액은 제작자의 자기 보고이며 거래 명세나 감사 자료로 독립 검증하지 않았다.

## 핵심 전략 요약

가장 반복되는 셋업은 상승 추세에서 음봉 눌림이 나온 뒤 그 기준봉 고가를 재돌파할 때 매수하는 방식이다. 단순 버전은 15분봉만 보고 2R을 목표로 하며, 강화 버전은 15분·1시간·일·주봉 방향이 모두 일치할 때만 진입하고 최소 2.5R을 요구한다. 별도 범위 전략은 장 시작 후 첫 두 15분봉이 만든 30분 고저 범위를 종가로 돌파한 방향에 진입해 반대편 범위 끝을 손절, 1R을 목표로 둔다.

다만 리더보드 기반 종목 선정은 표본 편향이 크고, 다중 시간대 추세의 정의와 세션 시간, 최대 허용 범위, 재진입, 수수료·슬리피지가 빠져 있다. 프로젝트에서는 이 규칙들을 즉시 사용 가능한 수익 전략이 아니라 백테스트해야 할 가설로 취급한다. 모의계좌 100회 검증과 자동매매의 모의 주문·연결 오류 테스트는 셋업 자체보다 우선하는 운영 원칙으로 반영했다.
