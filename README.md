# SIGNAL NOTE RESEARCH

기존 사이트와 별도로 빌드·배포하는 영상 리서치 사이트입니다. UI, 라우팅, 릴스·유튜브 분석 데이터를 모두 이 폴더 안에 보유하므로 독립 실행할 수 있습니다.

## 현재 상태

- Facebook Reels: 13개 출처, 5,658 / 5,661편 분석 완료(99.9%, 보류 3편)
- YouTube: 4개 채널, 공개 영상 185 / 185편 분석 완료
- 로그인·연령·멤버십·지역 제한으로 불완전하게 분석된 공개 YouTube 영상: 0편
- 최신 로컬 감사: 2026-08-25 Facebook Reels `Novo Legacy` 106편 전체 스크롤 재확인, 5,661편
- 공개 배포: `https://elymas.github.io/signal-note/`(2026-08-25 Novo Legacy 릴스 60편 추가)

사이트 분리, 채널별 진척률, 품질 점검, 배포 및 동기화 기준은 [작업 현황 문서](docs/PROJECT_STATUS_2026-08-21.md)를 참고합니다.

## 실행

```bash
npm install
npm run dev
npm run build
npm run preview
```

`hiddenriches-mimic` 모노레포 루트에서는 `npm run research:dev`, `npm run research:build`를 실행할 수 있습니다. 생성물은 이 프로젝트의 `dist/`에 출력됩니다.

## 라우트

- `/signal-note/` 영상 증거 아카이브 홈
- `/signal-note/reels/` 릴스 리서치
- `/signal-note/youtube/` 유튜브 채널 분석

## 폴더

- `src/` 사이트 UI와 라우팅
- `src/data/` 릴스·유튜브 분석 데이터
- `src/data/reels-sources.js` 릴스 출처 레지스트리
- `scripts/` 릴스 분석 준비·진척 스크립트
- `research/`, `docs/` 수집 체크포인트와 감사 문서

## 새 릴스 채널 추가 방법

1. 표준 형태(`slug`, `profileName`, `canonicalProfileUrl`, `analyzedAt`, `publishedRange`, `commonPrinciples`, `reels[]`)의 데이터 모듈을 `src/data/reels-pages/<slug>.js`로 만듭니다.
2. `src/data/reels-sources.js` 레지스트리에 한 줄을 추가합니다. `notes`는 칩에 먼저 표시되는 힌트 값이고 데이터가 로드되면 실제 값으로 대체됩니다.
3. 카드 수, 총 재생 시간, 규칙화 가능/전략 아님 요약은 데이터에서 자동 계산되므로 UI를 직접 수정할 필요가 없습니다.

## 디자인 시스템

- 라이트(페이퍼)/다크(터미널) 듀얼 테마. 첫 방문은 시스템 설정을 따르고 헤더 토글로 전환하면 `localStorage`에 저장됩니다.
- 타이포그래피: Archivo(라틴 디스플레이) + Pretendard(한글 본문) + IBM Plex Mono(데이터 라벨).
- 목록 화면의 검색·필터 툴바는 스크롤 시 상단에 고정되고, 카드 목록은 화면 폭에 따라 1~3단으로 자동 조절됩니다.
- 모든 텍스트 색 조합은 라이트/다크 모두 WCAG 2.1 AA(4.5:1) 이상으로 검증했습니다.

## 동기화

로컬 원본은 `hiddenriches-mimic/output_research/`, GitHub Pages 배포 저장소는 별도의 `signal-note/`입니다. 로컬 원본을 수정하는 것만으로는 배포되지 않으며, 관리 대상 파일을 배포 저장소에 동기화한 뒤 `signal-note/main`에 commit·push해야 합니다.

`node_modules/`, `dist/`, `.DS_Store`, 로컬 캐시와 임시 파일은 동기화하지 않습니다.

GitHub Pages 배포 주소는 `https://elymas.github.io/signal-note/`입니다. 빌드 후 각 공개 라우트에 정적 `index.html`을 만들고, 알 수 없는 경로에는 `404.html`을 제공해 `/signal-note/reels`, `/signal-note/youtube` 직접 접속도 React Router로 연결합니다.

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 npm clean install, Vite 빌드, GitHub Pages 배포를 순서대로 수행합니다.
