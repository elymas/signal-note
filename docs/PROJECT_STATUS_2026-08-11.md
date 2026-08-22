# SIGNAL NOTE 작업 현황 — 2026-08-11

> 이 문서는 당시 상태 기록이다. 최신 로컬 기준은 [`PROJECT_STATUS_2026-08-21.md`](PROJECT_STATUS_2026-08-21.md)다.

이 문서는 SIGNAL NOTE 전체 사이트와 별도 리서치 사이트의 현재 구조, 분석 범위, 품질 점검, 배포 상태를 함께 인계하기 위한 기준 문서다. 과거 세션 문서보다 이 문서를 우선한다.

## 1. 현재 결론

| 영역 | 상태 | 결과 |
| --- | --- | --- |
| 프로젝트 분리 | 완료 | 기존 전체 사이트는 `output_entire/`, 영상 리서치 사이트는 `output_research/`로 독립 관리 |
| 전체 사이트 정리 | 완료 | 릴스 리서치 제거, 종가 플레이북의 전체 영상 원장 제거, Anchored VWAP 플레이북 추가 |
| 리서치 사이트 | 완료·운영 중 | 홈, 릴스 리서치, 유튜브 분석을 독립 사이트로 구성 |
| GitHub Pages 배포 | 완료 | `https://elymas.github.io/signal-note/`에서 운영 |
| 공개 접근 감사 | 완료 | YouTube 공개 영상 150편 중 불완전 접근 0편 |
| 타이포 재조정 | 완료 | 노트북·태블릿·모바일에서 제목 고아줄과 가로 넘침 제거 |

## 2. 저장소와 동기화 기준

### 로컬 원본

- 전체 사이트: `/Users/masterp/Projects/superwork/hiddenriches-mimic/output_entire`
- 리서치 사이트: `/Users/masterp/Projects/superwork/hiddenriches-mimic/output_research`

### 배포 저장소

- Git 저장소: `/Users/masterp/Projects/superwork/signal-note`
- 원격 저장소: `elymas/signal-note`
- 공개 주소: `https://elymas.github.io/signal-note/`

`output_research/`를 수정하는 것만으로는 자동 배포되지 않는다. 배포가 필요한 변경은 `signal-note/`에 동기화한 뒤 `main` 브랜치에 커밋하고 push해야 한다. GitHub Actions가 설치, 빌드, Pages 배포를 자동 수행한다.

동기화 대상은 애플리케이션 소스, 데이터, 감사 문서, 스크립트와 설정이다. `node_modules/`, `dist/`, `.DS_Store`, 로컬 캐시와 임시 파일은 동기화 대상에서 제외한다.

## 3. 사이트 구성

### 전체 사이트 — `output_entire/`

- `/kr-stocks/closing-bet` — 종가 플레이북
- `/playbooks/anchored-vwap` — Anchored VWAP 플레이북
- 기존 `/reels-research` 페이지 제거
- 종가 플레이북의 `06 / ALL VIDEOS` 원장 제거 후 리서치 사이트의 유튜브 분석으로 이관
- 전략 상세 문서:
  - `docs/strategies/closing-bet-playbook.md`
  - `docs/strategies/anchored-vwap-playbook.md`

### 리서치 사이트 — `output_research/`

- `/signal-note/` — 영상 증거 아카이브 홈
- `/signal-note/reels/` — Facebook Reels 출처별 분석
- `/signal-note/youtube/` — YouTube 채널·영상별 분석

Vite의 base는 `/signal-note/`이며 React Router basename도 같은 경로를 사용한다. 빌드 후 스크립트가 각 공개 라우트에 정적 `index.html`을 만들고 `404.html`을 생성해 GitHub Pages 직접 접근을 지원한다.

## 4. 분석 범위

### Facebook Reels

2026-08-06 로그인 인벤토리 5,269편을 기준으로 2,754편을 분석했다. 전체 진척률은 **52.3%**이며, 남은 인벤토리는 2,515편이다.

| 출처 | 분석 완료 | 인벤토리 | 진척률 | 잔여 |
| --- | ---: | ---: | ---: | ---: |
| Ahmed On Chart | 102 | 102 | 100.0% | 0 |
| Travis Woo | 422 | 684 | 61.7% | 262 |
| Tarzan Trading TT | 386 | 386 | 100.0% | 0 |
| Erick Jablonski | 402 | 962 | 41.8% | 560 |
| LuxAlgo | 218 | 218 | 100.0% | 0 |
| TradersNotes Jason | 118 | 118 | 100.0% | 0 |
| Dumb Hunter | 422 | 1,701 | 24.8% | 1,279 |
| 코인하는 아나운서 | 262 | 262 | 100.0% | 0 |
| Max Anthony | 422 | 836 | 50.5% | 414 |
| **합계** | **2,754** | **5,269** | **52.3%** | **2,515** |

인벤토리 수는 로그인 계정과 감사 시점에 노출된 목록 기준이다. 분석 잔여 수를 접근 실패로 해석해서는 안 되며, 공개 범위 변경과 삭제·재게시 여부는 다음 배치 시작 전에 다시 감사한다.

### YouTube

| 채널 | 장문 | Shorts | 공개 영상 | 분석 | 공개 기준 진척률 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 주식해서한강뷰삼촌 | 75 | 11 | 86 | 86 | 100% |
| 10억만든 일반인 | 4 | 5 | 9 | 9 | 100% |
| 매매의정석 | 11 | 44 | 55 | 55 | 100% |
| **합계** | **90** | **60** | **150** | **150** | **100%** |

- 로그인, 연령, 멤버십, 지역 제한으로 불완전하게 분석된 공개 영상: 0편
- `10억만든 일반인` 1편은 YouTube 자막 요청의 일시적 429 응답 때문에 원본 오디오를 직접 전사해 보완
- 주식해서한강뷰삼촌 채널 헤더의 87편 표기와 공개 목록 86편의 차이 1편은 비공개·삭제·예약·집계 지연 중 무엇인지 외부에서 확정할 수 없어 감사 문서에 별도 기록

## 5. 품질과 보류 이슈

- 과거 품질 레코드 누락 4건을 데이터에 복구했다.
- 보류 5건을 재확인해 해결 상태로 정리했다.
- 사용하지 않는 2026-08-06 임시 폴더는 제거했다.
- 공개 접근 제한 때문에 내용이 비어 있거나 추정으로만 작성된 YouTube 영상은 없다.
- 원본의 수익률, 승률, 자산, 대회 성적과 레버리지 결과는 독립 검증값이 아니라 `영상 주장·미검증`으로 분리한다.
- 비공개 지표, 선택 사례, 리페인팅 가능성, 수수료·펀딩비·슬리피지 누락은 영상별 검증 포인트에 남긴다.

## 6. 디자인과 브라우저 검증

기존 SIGNAL NOTE의 편집 원장·필드 데스크 톤은 유지하고 타이포 계층만 재조정했다.

- 1280px 홈 제목: 76.8px에서 64px로 조정, 의도한 3줄 유지
- 홈 소개문: 24px에서 18.5px로 조정, 3줄 유지
- 릴스·유튜브 상단 제목: 79.36px에서 64px로 조정, 각 2줄 유지
- 섹션 제목, 릴스 카드, YouTube 카드와 모바일 전용 크기를 단계적으로 축소
- 한국어 제목에 `word-break: keep-all`과 `text-wrap: balance` 적용

검증 뷰포트는 1280×882, 1024×768, 390×844이며 세 라우트 모두 가로 넘침이 없음을 확인했다. 기능 변경 커밋 `efab039`의 GitHub Pages 배포도 성공했다.

## 7. 빌드와 배포

```bash
# 전체 사이트
npm run entire:build

# 리서치 사이트
npm run research:build

# 두 사이트
npm run build
```

리서치 배포 저장소에서는 다음 순서가 기준이다.

1. `output_research/`와 `signal-note/`의 관리 대상 파일을 동기화한다.
2. `npm run build`로 Vite 빌드와 SPA fallback 생성을 확인한다.
3. 홈·릴스·유튜브 라우트를 노트북 및 모바일 폭에서 확인한다.
4. `signal-note/main`에 커밋하고 push한다.
5. `Deploy to GitHub Pages` 워크플로 성공 후 공개 URL을 캐시 우회로 재검증한다.

## 8. 다음 작업 기준

1. 릴스 잔여 2,515편은 기존 체크포인트를 기준으로 다음 배치에서 이어서 분석한다.
2. 채널에 새 영상이 게시되거나 공개 상태가 바뀌면 인벤토리와 접근 감사를 먼저 갱신한다.
3. 분석 수치가 바뀌면 `src/research-constants.js`, 채널 데이터, 감사 문서와 이 상태 문서를 같은 커밋에서 갱신한다.
4. 배포 전에는 로컬 원본과 배포 저장소의 관리 대상 파일 차이가 없어야 한다.
