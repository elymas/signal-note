# SIGNAL NOTE 작업 현황 — 2026-08-19

> 이 문서는 당시 상태 기록이다. 최신 로컬 기준은 [`PROJECT_STATUS_2026-08-21.md`](PROJECT_STATUS_2026-08-21.md)다.

이 문서는 2026-08-11 상태 문서 이후의 YouTube 증분 감사를 반영한 최신 기준이다. 사이트 구조·배포 방식·릴스 진척률은 이전 문서와 동일하며, YouTube 인벤토리와 콘텐츠 데이터만 갱신했다.

## 현재 결론

| 영역 | 상태 | 결과 |
| --- | --- | --- |
| 프로젝트 분리 | 완료 | `output_entire/`와 `output_research/`를 독립 관리 |
| Facebook Reels | 진행 중 | 2,754 / 5,269편, 52.3% |
| YouTube 증분 감사 | 완료 | 3개 채널 공개 영상 154 / 154편 콘텐츠화 |
| 신규 영상 | 완료 | 주식해서한강뷰삼촌 장문 4편 추가 |
| 공개 접근 | 완료 | 불완전 분석 0편, 공개 목록 밖 미확인 차이 1편 |
| 로컬 반영 | 완료 | 데이터·화면 수치·README·감사 문서 갱신 |
| 배포 저장소 동기화 | 완료 | `signal-note/main`에 YouTube 154편 상태 동기화·push |

## YouTube 공개 인벤토리

| 채널 | 장문 | Shorts | 공개 영상 | 분석 | 공개 기준 진척률 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 주식해서한강뷰삼촌 | 79 | 11 | 90 | 90 | 100% |
| 10억만든 일반인 | 4 | 5 | 9 | 9 | 100% |
| 매매의정석 | 11 | 44 | 55 | 55 | 100% |
| **합계** | **94** | **60** | **154** | **154** | **100%** |

`10억만든 일반인`과 `매매의정석`은 2026-08-11 기준 영상 ID와 동일하다. `주식해서한강뷰삼촌`만 2026-08-11·12·14·18 업로드 4편이 추가됐다. 채널 헤더 91편과 공개 목록 90편의 차이 1편은 계속 미확인 상태다.

## 반영 파일

- `src/data/hidden-riches-video-data.js`: 신규 4편 콘텐츠와 채널 감사 수치
- `src/data/youtube-research-data.js`: 채널별·통합 감사 수치
- `src/research-constants.js`: 사이트 공통 통계
- `src/youtube-research-page.jsx`, `src/research-home-page.jsx`: 하드코딩된 공개 영상 수 제거·갱신
- `docs/youtube/hidden-riches-channel-audit-2026-08-19.md`: 증분 감사 근거
- 루트 및 리서치 README: 최신 커버리지와 상태 문서 링크

## 저장소와 배포

로컬 원본은 `/Users/masterp/Projects/superwork/hiddenriches-mimic/output_research`, 공개 배포 저장소는 `/Users/masterp/Projects/superwork/signal-note`다. 2026-08-19 YouTube 154편 상태를 배포 저장소 `main`에 동기화·push했으며, GitHub Actions의 Pages 워크플로가 빌드와 공개 배포를 수행한다. 이후 변경도 로컬 원본 수정, 배포 저장소 동기화, 빌드·브라우저 검증, commit·push 순서를 따른다.

## 다음 작업 기준

1. 세 채널의 Videos·Shorts 목록을 영상 ID로 주기적으로 재감사한다.
2. 새 영상이 있으면 제목·설명·자동자막 또는 원본 음성을 대조한 뒤 기존 스키마로 콘텐츠화한다.
3. 공개 수치 변경 시 데이터, 공통 통계, 화면, README와 상태 문서를 같은 변경에서 갱신한다.
4. 배포 전 로컬 원본과 배포 저장소의 관리 대상 파일 차이, 빌드와 공개 라우트를 확인한다.
