# SIGNAL NOTE RESEARCH

기존 사이트와 별도로 빌드·배포하는 영상 리서치 사이트입니다. UI, 라우팅, 릴스·유튜브 분석 데이터를 모두 이 폴더 안에 보유하므로 독립 실행할 수 있습니다.

## 실행

```bash
npm install
npm run dev
npm run build
npm run preview
```

루트 관리 명령을 사용하려면 `npm run research:dev`, `npm run research:build`를 실행합니다. 생성물은 이 폴더의 `dist/`에 출력됩니다.

## 라우트

- `/signal-note/` 영상 증거 아카이브 홈
- `/signal-note/reels` 릴스 리서치
- `/signal-note/youtube` 유튜브 채널 분석

## 폴더

- `src/` 사이트 UI와 라우팅
- `src/data/` 릴스·유튜브 분석 데이터
- `scripts/` 릴스 분석 준비·진척 스크립트
- `research/`, `docs/` 수집 체크포인트와 감사 문서

GitHub Pages 배포 주소는 `https://elymas.github.io/signal-note/`입니다. 빌드 후 `index.html`을 `404.html`로 복제해 `/signal-note/reels`, `/signal-note/youtube` 직접 접속도 React Router로 연결합니다.

## 배포

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 npm clean install, Vite 빌드, GitHub Pages 배포를 순서대로 수행합니다.
