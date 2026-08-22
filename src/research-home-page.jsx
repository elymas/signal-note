import { ArrowDownRight, ArrowRight, CheckCircle2, FileSearch, ScanSearch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { researchModules, researchStats } from './research-constants';
import { reelsArchiveNotes, reelsSources } from './data/reels-sources.js';

const processSteps = [
  [ScanSearch, '01', 'ENUMERATE', '공개 목록을 끝까지 확인하고 고유 영상 ID로 중복을 제거합니다.'],
  [FileSearch, '02', 'TRANSCRIBE', '제목·설명·자동자막·원본 음성을 대조해 영상이 실제로 말한 내용을 고정합니다.'],
  [CheckCircle2, '03', 'NORMALIZE', '셋업·진입·청산·리스크로 번역하고 재현 조건이 없으면 전략으로 세지 않습니다.'],
  [ShieldCheck, '04', 'AUDIT', '로그인 제한·누락·중복·성과 과장을 별도 기록하고 원본 링크를 보존합니다.'],
];

export function ResearchHomePage() {
  const archiveTotal = researchStats.reelsAnalyzed + researchStats.youtubeVideos;

  return (
    <>
      <section className="rs-home-hero">
        <div className="rs-grid-field" aria-hidden="true" />
        <div className="rs-hero-copy rs-reveal">
          <span className="rs-eyebrow"><i /> VIDEO INTELLIGENCE / FIELD DESK</span>
          <h1>영상이 <em>말한 것</em>과<br />검증된 것을<br />분리합니다.</h1>
          <p>릴스와 YouTube를 짧은 추천 피드가 아닌 검토 가능한 리서치 원장으로 바꿉니다. 원본은 그대로 두고, 전략·주장·검증 한계를 다시 읽을 수 있는 구조로 편집합니다.</p>
          <div className="rs-hero-actions">
            <Link className="rs-primary-button" to="/reels">릴스 아카이브 <ArrowRight size={16} /></Link>
            <Link className="rs-secondary-button" to="/youtube">유튜브 분석 <ArrowDownRight size={16} /></Link>
          </div>
        </div>
        <aside className="rs-evidence-board rs-reveal delay-1" aria-label="리서치 증거 원장 예시">
          <header><span><i className="rs-live-dot" /> LIVE ARCHIVE</span><b>Evidence ledger</b><em>UPDATED</em></header>
          <div className="rs-board-score">
            <span><small>PUBLIC ITEMS</small><b>{archiveTotal.toLocaleString('ko-KR')}</b></span>
            <i>+</i>
            <span><small>RESTRICTED</small><b>0</b></span>
          </div>
          <div className="rs-board-lines" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          <ol>
            <li><span>FB</span><b>Source transcript</b><em>{researchStats.reelsAnalyzed.toLocaleString('ko-KR')} notes</em></li>
            <li><span>YT</span><b>Channel coverage</b><em>{researchStats.youtubeVideos} / {researchStats.youtubeVideos}</em></li>
            <li><span>QA</span><b>Claim isolation</b><em>always on</em></li>
          </ol>
          <footer><span /> 원본 → 전사 → 규칙 → 검증 포인트</footer>
        </aside>
      </section>

      <section className="rs-coverage-strip" aria-label="전체 분석 범위">
        <span><small>REELS SOURCES</small><b>{reelsSources.length}</b><em>공개 프로필</em></span>
        <span><small>ARCHIVE NOTES</small><b>{reelsArchiveNotes.toLocaleString('ko-KR')}</b><em>영상별 노트</em></span>
        <span><small>YOUTUBE CHANNELS</small><b>{researchStats.youtubeChannels}</b><em>전수 감사</em></span>
        <span><small>YOUTUBE VIDEOS</small><b>{researchStats.youtubeVideos}</b><em>공개 영상</em></span>
      </section>

      <section className="rs-section-shell rs-module-section">
        <header className="rs-section-heading">
          <div><span>01 / RESEARCH ROOMS</span><h2>두 개의 아카이브,<br />하나의 검증 기준.</h2></div>
          <p>플랫폼의 소비 방식은 다르지만 분석 기준은 같습니다. 콘텐츠를 추천하지 않고, 영상이 제시한 규칙과 그 규칙이 아직 증명하지 못한 것을 나란히 보여 줍니다.</p>
        </header>
        <div className="rs-module-grid">
          {researchModules.map((module) => (
            <Link className={`rs-module-card ${module.accent}`} to={module.href} key={module.href}>
              <header><span>{module.index}</span><small>{module.kicker}</small><ArrowRight size={18} /></header>
              <div><small>{module.metricLabel}</small><strong>{module.metric}</strong></div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <footer>아카이브 입장 <i /></footer>
            </Link>
          ))}
        </div>
      </section>

      <section className="rs-process-section">
        <div className="rs-section-shell">
          <header className="rs-section-heading inverse">
            <div><span>02 / METHOD</span><h2>조회 수가 아니라<br />증거의 순서.</h2></div>
            <p>짧은 영상일수록 자막 한 줄이나 성공 장면 하나가 전체 전략처럼 보이기 쉽습니다. 그래서 분석 순서를 고정합니다.</p>
          </header>
          <div className="rs-process-grid">
            {processSteps.map(([Icon, index, code, copy]) => (
              <article key={code}><span>{index}</span><Icon size={21} /><h3>{code}</h3><p>{copy}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="rs-section-shell rs-standard-section">
        <div className="rs-standard-copy">
          <span>03 / EDITORIAL STANDARD</span>
          <h2>‘수익이 났다’와<br />‘재현할 수 있다’는<br />다른 문장입니다.</h2>
        </div>
        <div className="rs-standard-ledger">
          <article><span>A</span><div><b>영상 주장</b><p>승률·수익률·자산·대회 성적은 원 제작자의 주장으로 표시합니다.</p></div></article>
          <article><span>B</span><div><b>실행 규칙</b><p>셋업, 진입, 무효화, 청산과 비용 조건이 있어야 재현 후보가 됩니다.</p></div></article>
          <article><span>C</span><div><b>검증 한계</b><p>작은 표본, 사후 선택, 비공개 지표, 레버리지와 리페인팅을 따로 기록합니다.</p></div></article>
          <article><span>D</span><div><b>원본 보존</b><p>모든 노트는 출처 영상으로 돌아갈 수 있고 공개 접근 상태를 함께 감사합니다.</p></div></article>
        </div>
      </section>
    </>
  );
}
