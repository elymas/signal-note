# SIGNAL NOTE 작업 현황 — 2026-08-21

이 문서는 2026-08-21 Facebook Reels 로그인 인벤토리 재감사와 2026-08-19 YouTube 증분 감사 결과를 합친 최신 로컬 기준이다.

## 현재 결론

| 영역 | 상태 | 결과 |
| --- | --- | --- |
| 프로젝트 분리 | 완료 | `output_entire/`와 `output_research/`를 독립 관리 |
| Facebook Reels 인벤토리 | 재감사 완료 | 13개 출처 5,661편, Novo Legacy 106편 확인 |
| Facebook Reels 분석 | 완료 | 5,658 / 5,661편, 대기 0편, 보류 3편 |
| YouTube 증분 감사 | 완료 | 4개 채널 공개 영상 185 / 185편 콘텐츠화 |
| Reels 무결성 | 통과 | 인벤토리·분석 ID 전부 포함, 내부·출처 간 중복 0건 |
| 로컬 반영 | 완료 | 새 인벤토리·체크포인트·공통 통계·README·감사 문서 갱신 |
| 배포 저장소 동기화 | 미수행 | 2026-08-21 Reels 감사 변경은 로컬에만 존재 |

## Facebook Reels 로그인 인벤토리

| 채널 | 분석 완료 | 로그인 목록 | 진척률 | 잔여 | 이전 대비 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ahmed On Chart | 127 | 127 | 100.0% | 0 | +25 |
| Travis Woo | 690 | 690 | 100.0% | 0 | +136 |
| Tarzan Trading TT | 394 | 394 | 100.0% | 0 | +8 |
| Erick Jablonski | 820 | 977 | 83.9% | 157 | +214 |
| LuxAlgo | 223 | 223 | 100.0% | 0 | +5 |
| TradersNotes Jason | 129 | 129 | 100.0% | 0 | +11 |
| Dumb Hunter | 838 | 1,769 | 47.4% | 929 | +265 |
| 코인하는 아나운서 | 275 | 276 | 99.6% | 0 | +14 |
| Max Anthony | 840 | 851 | 98.7% | 11 | +214 |
| Omar Agag | 49 | 49 | 100.0% | 0 | +49 |
| yostrades | 10 | 10 | 100.0% | 0 | +10 |
| Trade with Pat | 60 | 60 | 100.0% | 0 | +60 |
| Novo Legacy | 106 | 106 | 100.0% | 0 | +106 |
| **합계** | **5,658** | **5,661** | **99.9%** | **0** | **+790** |

상세 절차와 ID 무결성 결과는 [`docs/reels/authenticated-inventory-audit-2026-08-23.md`](reels/authenticated-inventory-audit-2026-08-23.md)를 기준으로 한다. 2026-08-25 Novo Legacy 릴스 탭을 끝까지 스크롤해 106편으로 갱신하고, 추가 46편을 메타데이터·캡션 대조 후 콘텐츠화했다. 기존 보류 3편은 유지했다.

## YouTube 공개 인벤토리

| 채널 | 장문 | Shorts | 공개 영상 | 분석 | 공개 기준 진척률 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 주식해서한강뷰삼촌 | 79 | 11 | 90 | 90 | 100% |
| 10억만든 일반인 | 4 | 5 | 9 | 9 | 100% |
| 매매의정석 | 11 | 44 | 55 | 55 | 100% |
| 주식은주광일 | 31 | 0 | 31 | 31 | 100% |
| **합계** | **125** | **60** | **185** | **185** | **100%** |

`주식해서한강뷰삼촌` 채널 헤더 91편과 공개 목록 90편의 차이 1편은 계속 미확인 상태다. `주식은주광일`은 Aside와 yt-dlp 목록에서 공개 영상 31편을 확인했다. 로그인·연령·멤버십·지역 제한으로 불완전하게 분석된 공개 YouTube 영상은 0편이다.

## 반영 파일

- `research/reels-inventory/facebook-login-2026-08-21.json`: 13개 출처 5,615개 ID
- `research/reels-analysis/checkpoint.json`: 새 인벤토리 기준선과 잔여 1,807편(보류 2편), 최근 869편 누적 게시
- `scripts/reels-analysis-prepare.mjs`, `scripts/reels-analysis-progress.mjs`: 새 인벤토리 경로
- `src/research-constants.js`: 공개 사이트 릴스 인벤토리 5,615편·감사일 2026-08-25
- `docs/reels/authenticated-inventory-audit-2026-08-21.md`: 재감사 근거
- 루트 및 리서치 README: 최신 로컬 커버리지와 상태 문서 링크

## 저장소와 배포

로컬 원본은 `/Users/masterp/Projects/superwork/hiddenriches-mimic/output_research`, 공개 배포 저장소는 `/Users/masterp/Projects/superwork/signal-note`다. 2026-08-19 YouTube 154편 상태까지는 배포 저장소 `main`에 동기화·push됐지만, 2026-08-21 Reels 감사 변경은 아직 동기화하지 않았다.

## 다음 작업 기준

1. 릴스 잔여 2,259편은 2026-08-21 체크포인트와 인벤토리를 기준으로 이어서 분석한다.
2. 신규 ID 167개도 다른 미분석 ID와 동일하게 메타데이터·자막·음성·대표 프레임을 검증한다.
3. 분석 수치가 바뀌면 데이터, 공통 통계, README와 상태 문서를 같은 변경에서 갱신한다.
4. 배포 전 로컬 원본과 배포 저장소의 관리 대상 파일 차이, 빌드와 공개 라우트를 확인한다.
