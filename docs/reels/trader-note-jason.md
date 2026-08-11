# TradersNotes Jason Facebook Reels 전수 조사

- 원본 공유 URL: <https://www.facebook.com/share/1By9MpWRzT/?mibextid=wwXIfr>
- 해석한 공개 Reels 탭: <https://www.facebook.com/people/TradersNotes-Jason/61583704273519/?sk=reels_tab>
- 분석 기준일: 2026.08.03
- 공개 목록에서 확인한 범위: 2026.07.23–2026.08.02, 10개, 9분 43초

## 전체 열거

| # | 게시일 | 길이 | Reel ID | 원문 캡션/제목 | 분류 | 판정 | 핵심 |
|---:|---|---:|---|---|---|---|---|
| 1 | 2026.08.02 | 00:43 | [4564920586987572](https://www.facebook.com/reel/4564920586987572/) | How a trader accurately predicted the market with Bookmap. | setup | 규칙화 가능 | 매수 체결을 흡수한 대기 매도와 수준 재이탈에 반응 |
| 2 | 2026.08.01 | 01:10 | [2780957898970637](https://www.facebook.com/reel/2780957898970637/) | How to actually learn. | psychology | 핵심 원칙 | 트레이딩을 세부 기술로 쪼개 한 번에 한 오류를 교정 |
| 3 | 2026.07.30 | 01:03 | [1344758734490682](https://www.facebook.com/reel/1344758734490682/) | Veteran trader ranks trading concepts. | commentary | 전략 아님 | 볼륨 프로파일·오더플로우를 높게 평가한 정성적 도구 순위 |
| 4 | 2026.07.29 | 00:22 | [2131272040751600](https://www.facebook.com/reel/2131272040751600/) | What each trading method actually tells you so you can pick the one that fits your edge. | setup | 검증 필요 | 캔들로 구조, 볼륨 프로파일로 레벨, Bookmap으로 실행·타겟 |
| 5 | 2026.07.28 | 00:51 | [1739816254108846](https://www.facebook.com/reel/1739816254108846/) | Profitable Trader Explains Why Mindset Beats Strategy | psychology | 핵심 원칙 | 몇 번의 손실을 견딜 수 있는 크기로 위험을 제한 |
| 6 | 2026.07.27 | 00:50 | [1098797075952551](https://www.facebook.com/reel/1098797075952551/) | Overrated vs. underrated trading concepts. | commentary | 전략 아님 | 가격 형태 도구를 거래량·주문 맥락으로 보완하라는 도구 비평 |
| 7 | 2026.07.26 | 01:19 | [1375882847783839](https://www.facebook.com/reel/1375882847783839/) | You’ll never have it all figured out. | psychology | 전략 아님 | 성공 후에도 불확실성은 계속된다는 일반 동기부여 |
| 8 | 2026.07.25 | 00:38 | [4389842954622807](https://www.facebook.com/reel/4389842954622807/) | 9 Figure Trader Spots Fake Breakouts Using CVD. | setup | 규칙화 가능 | 큰 대기 매수를 깨려면 CVD 매도 모멘텀이 가격보다 선행해야 함 |
| 9 | 2026.07.24 | 01:15 | [1763126205104780](https://www.facebook.com/reel/1763126205104780/) | Every trading method ranked so you stop wasting time on the wrong tools. | commentary | 전략 아님 | 볼륨 프로파일 S, VWAP·풋프린트 A로 둔 정성적 티어리스트 |
| 10 | 2026.07.23 | 01:32 | [1030041603339063](https://www.facebook.com/reel/1030041603339063/) | Trading Tools Explained. | setup | 검증 필요 | 하방 유동성 스윕에서 CVD 매도와 가격 하락의 불일치를 흡수로 해석 |

## 분석법

1. `jason-reels` agent-browser 세션에서 공유 URL을 열어 `TradersNotes Jason`, 프로필 ID `61583704273519`로 해석했다.
2. 해석된 `?sk=reels_tab` 페이지를 스크롤하며 `/reel/{id}` 앵커를 수집하고 ID로 중복 제거했다.
3. yt-dlp 2026.07.04로 각 URL의 ID, 게시일, 초 단위 길이, 캡션을 확인하고 공개 영상 10개를 전부 다운로드했다.
4. 모든 영상을 `mlx-community/whisper-large-v3-turbo`(영어 고정)로 전사했다.
5. 각 영상의 8초 간격 컨택트 시트를 보고 자막·Bookmap 히트맵·CVD·볼륨 프로파일·도구 티어 화면이 전사와 일치하는지 확인했다.
6. “규칙화 가능”은 조건의 순서와 무효화 논리를 추출할 수 있는 영상, “검증 필요”는 워크플로나 개념은 있지만 진입·손절·목표가 불완전한 영상, “전략 아님”은 도구 순위·의견·동기부여로 구분했다.

## 완전성 검증

- 로그아웃 공개 Reels 탭 DOM에서 노출된 앵커는 10개였고 모두 고유 ID였다.
- 페이지 끝으로 스크롤한 후에도 DOM 높이 `633`, Reel URL 집합 10개가 변하지 않았다.
- 목록 10개와 yt-dlp 메타데이터 10개, 다운로드 영상 10개, Whisper 전사 10개, 컨택트 시트 10개를 ID별로 1:1 대조했다.
- 게시일은 yt-dlp의 `upload_date`, 길이는 `duration`/`duration_string`을 사용했다. 합계 583초(9분 43초)다.
- 페이지 공개 목록의 정렬과 게시일은 최신 2026.08.02에서 최초 2026.07.23 순으로 일치했다.

## 접근 제한과 해석 주의

- Facebook은 비로그인 상태에서 10개 타일 하단에 **“See more on Facebook”** 로그인 유도를 표시했다. 반복 스크롤로 추가 타일은 로드되지 않았다.
- 따라서 이 문서의 `reelCount: 10`은 **2026.08.03에 비로그인 공개 Reels 탭이 노출한 전체 10개**를 뜻한다. 로그인한 계정에만 더 오래된 영상이 노출될 가능성은 배제할 수 없다.
- 삭제·비공개·지역/연령 제한 릴스는 확인할 수 없다. Facebook의 개인화·실험 여부도 확인할 수 없다.
- 캡션과 음성의 “9 figure trader”, “veteran”, “profitable” 등은 페이지 자체 표현으로 보관했으며 신원·실적을 독립 검증하지 못했다.
- 도구 순위와 “기관 알고리즘”에 대한 포괄적 주장은 비교 실험이 아니다. CVD·Bookmap 셋업도 손절, 슬리피지, 수수료, 시장/시간대 별 표본 외 검증이 필요하다.

## 요약

이 페이지의 공개 릴스는 가격 패턴 단독 해석보다 볼륨 프로파일·오더플로우·CVD·Bookmap을 통해 “어디서 실제로 거래되었고, 누가 공격했으며, 가격이 그 공격에 반응했는가”를 보라는 논지가 반복된다. 가장 구체적인 셋업은 (1) Bookmap 대기 매도에서 매수 흡수 후 하락 반응, (2) 큰 대기 매수를 하향 돌파할 때 CVD 매도 모멘텀의 선행 확인, (3) 하방 유동성 스윕에서 매도 CVD와 가격의 불일치를 흡수로 보는 반등 가설이다. 다만 어떤 영상도 완전한 손절·목표·포지션 크기를 제시하지 않았으므로 수익성을 단정할 수 없다.
