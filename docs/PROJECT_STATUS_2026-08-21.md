# SIGNAL NOTE 작업 현황 — 2026-08-21

이 문서는 2026-08-26 Facebook Reels 데이터 구조 전수조사와 기존 YouTube 감사 결과를 합친 최신 로컬 기준이다.

## 현재 결론

| 영역 | 상태 | 결과 |
| --- | --- | --- |
| 프로젝트 분리 | 완료 | `output_entire/`와 `output_research/`를 독립 관리 |
| Facebook Reels 인벤토리 | 재감사 완료 | 15개 출처 6,408편 확인 |
| Facebook Reels 분석 | 재작업 중 | 실제 콘텐츠 객체 5,149편, 원본 전사 대기 1,256편, 보류 3편 |
| YouTube 증분 감사 | 완료 | 4개 채널 공개 영상 185 / 185편 콘텐츠화 |
| Reels 무결성 | 수정 완료 | 상세 페이지·출처 카드·공통 통계를 실제 `reels` 객체 기준으로 통일, 중복 0건 |
| 로컬 반영 | 완료 | 새 인벤토리·체크포인트·공통 통계·README·감사 문서 갱신 |
| 배포 저장소 동기화 | 미수행 | 2026-08-21 Reels 감사 변경은 로컬에만 존재 |

## Facebook Reels 로그인 인벤토리

| 채널 | 실제 콘텐츠 | 로그인 목록 | 진척률 | 전사 대기 | 보류 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ahmed On Chart | 130 | 130 | 100.0% | 0 | 0 |
| Travis Woo | 702 | 702 | 100.0% | 0 | 0 |
| Tarzan Trading TT | 396 | 396 | 100.0% | 0 | 0 |
| Erick Jablonski | 979 | 979 | 100.0% | 0 | 0 |
| LuxAlgo | 224 | 224 | 100.0% | 0 | 0 |
| TradersNotes Jason | 132 | 132 | 100.0% | 0 | 0 |
| Dumb Hunter | 525 | 1,783 | 29.4% | 1,256 | 2 |
| 코인하는 아나운서 | 275 | 276 | 99.6% | 0 | 1 |
| Max Anthony | 856 | 856 | 100.0% | 0 | 0 |
| Omar Agag | 49 | 49 | 100.0% | 0 | 0 |
| yostrades | 36 | 36 | 100.0% | 0 | 0 |
| Trade with Pat | 121 | 121 | 100.0% | 0 | 0 |
| Novo Legacy | 106 | 106 | 100.0% | 0 | 0 |
| 20-Minute Trader | 371 | 371 | 100.0% | 0 | 0 |
| Raghee Horner | 247 | 247 | 100.0% | 0 | 0 |
| **합계** | **5,149** | **6,408** | **80.4%** | **1,256** | **3** |

상세 절차와 ID 무결성 결과는 [`docs/reels/authenticated-inventory-audit-2026-08-23.md`](reels/authenticated-inventory-audit-2026-08-23.md)를 기준으로 한다. 과거 진척 검사는 소스의 ID 주석과 설명 배열 안에 잘못 들어간 객체까지 분석 완료로 세어 6,405편으로 과대 집계했다. 2026-08-26부터는 상세 페이지에 실제 렌더링되는 고유 `reels` 객체만 분석 완료로 센다.

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

- `research/reels-inventory/facebook-login-2026-08-21.json`: 15개 출처 6,408개 ID
- `research/reels-analysis/checkpoint.json`: 보류 3편
- `scripts/reels-analysis-prepare.mjs`: 자동 자막 우선, 미제공 시 로컬 Whisper 전사, 화면 콘택트시트 생성
- `scripts/reels-analysis-progress.mjs`: ID 문자열이 아니라 실제 로드된 `reels` 객체 기준 집계
- `src/research-constants.js`: 실제 콘텐츠 5,149편·전체 인벤토리 6,408편
- `docs/reels/authenticated-inventory-audit-2026-08-21.md`: 재감사 근거
- 루트 및 리서치 README: 최신 로컬 커버리지와 상태 문서 링크

## 저장소와 배포

로컬 원본은 `/Users/masterp/Projects/superwork/hiddenriches-mimic/output_research`, 공개 배포 저장소는 `/Users/masterp/Projects/superwork/signal-note`다. 2026-08-19 YouTube 154편 상태까지는 배포 저장소 `main`에 동기화·push됐지만, 2026-08-21 Reels 감사 변경은 아직 동기화하지 않았다.

## 다음 작업 기준

1. Novo Legacy 106편, 20-Minute Trader 371편, Raghee Horner 247편을 자동 자막·로컬 전사·대표 프레임으로 우선 재작업한다.
2. Dumb Hunter 전사 대기 1,256편은 같은 공정으로 이어서 분석한다.
3. 분석 수치가 바뀌면 데이터, 공통 통계, README와 상태 문서를 같은 변경에서 갱신한다.
4. 배포 전 로컬 원본과 배포 저장소의 관리 대상 파일 차이, 빌드와 공개 라우트를 확인한다.
