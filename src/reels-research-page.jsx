import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Video,
} from 'lucide-react';
import { researchStats } from './research-constants';

const reelKinds = [
  { id: 'all', label: '전체' },
  { id: 'setup', label: '셋업' },
  { id: 'risk', label: '리스크' },
  { id: 'psychology', label: '심리·규율' },
  { id: 'commentary', label: '사례·논평' },
];
const kindById = new Map(reelKinds.map((kind) => [kind.id, kind]));
const principleIcons = [ShieldAlert, SlidersHorizontal, CheckCircle2, FlaskConical];

const sourceDefinitions = [
  { slug: 'ahmed-on-chart', profileName: 'Ahmed On Chart', reelCount: 127, totalDuration: '1시간 17분 03초', load: () => import('./data/reels-pages/ahmed-on-chart.js').then((module) => module.ahmedOnChartResearch) },
  { slug: 'travis-woo', profileName: 'Travis Woo', reelCount: 471, totalDuration: '22시간 07분 38초', load: () => import('./data/reels-pages/travis-woo.js').then((module) => module.travisWooResearch) },
  { slug: 'tarzan-trading-tt', profileName: 'Tarzan Trading TT', reelCount: 394, totalDuration: '67시간 47분 49초', load: () => import('./data/reels-pages/tarzan-trading-tt.js').then((module) => module.tarzanTradingTTResearch) },
  { slug: 'erick-jablonski', profileName: 'Erick Jablonski', reelCount: 451, totalDuration: '7시간 40분 23초', load: () => import('./data/reels-pages/erick-jablonski.js').then((module) => module.erickJablonskiResearch) },
  { slug: 'luxalgo', profileName: 'LuxAlgo', reelCount: 223, totalDuration: '6시간 30분 12초', load: () => import('./data/reels-pages/luxalgo.js').then((module) => module.luxalgoResearch) },
  { slug: 'trader-note-jason', profileName: 'TradersNotes Jason', reelCount: 129, totalDuration: '2시간 52분 37초', load: () => import('./data/reels-pages/trader-note-jason.js').then((module) => module.traderNoteJasonResearch) },
  { slug: 'dumb-hunter', profileName: 'Dumb Hunter', reelCount: 471, totalDuration: '6시간 42분 55초', load: () => import('./data/reels-pages/dumb-hunter.js').then((module) => module.dumbHunterResearch) },
  { slug: 'coin-announcer', profileName: '코인하는 아나운서', reelCount: 275, totalDuration: '3시간 40분 03초', load: () => import('./data/reels-pages/coin-announcer.js').then((module) => module.coinAnnouncerResearch) },
  { slug: 'max-anthony', profileName: 'Max Anthony', reelCount: 471, totalDuration: '8시간 15분 57초', load: loadMaxAnthonyResearch },
  { slug: 'omar-agag', profileName: 'Omar Agag', reelCount: 49, totalDuration: '1시간 00분 13초', load: () => import('./data/reels-pages/omar-agag.js').then((module) => module.omarAgagResearch) },
];

const sourceDefinitionBySlug = new Map(sourceDefinitions.map((source) => [source.slug, source]));
const sourceCache = new Map();

async function loadMaxAnthonyResearch() {
  const { getReelUrl: createReelUrl, reelResearch, reelsResearchMeta } = await import('./data/reels-research-data.js');
  return {
    slug: 'max-anthony',
    profileName: reelsResearchMeta.profileName,
    canonicalProfileUrl: reelsResearchMeta.profileUrl,
    analyzedAt: reelsResearchMeta.analyzedAt,
    publishedRange: reelsResearchMeta.publishedRange,
    reelCount: reelsResearchMeta.reelCount,
    totalDuration: reelsResearchMeta.totalDuration,
    methodology: '공개 릴스 탭 전체를 수집한 뒤 자동 전사와 영상 맥락을 교차 확인하고, 재현 가능한 조건이 없는 영상은 전략 아님으로 분리했다.',
    commonPrinciples: [
      { code: 'RISK FIRST', title: '셋업보다 생존', copy: '레버리지·마진·일일 손실 한도는 진입 신호보다 먼저 정의합니다.' },
      { code: 'CLEAN SPACE', title: '왼쪽을 확인', copy: '돌파 직후 저항까지 남은 공간이 목표 위험비를 충족하는지 확인합니다.' },
      { code: 'RE-ENTRY', title: '가설과 주문을 분리', copy: '첫 주문이 끝나도 가설이 유효하면 새 트리거에서 제한적으로 재진입합니다.' },
      { code: 'VALIDATE', title: '이름보다 규칙', copy: 'FVG·오더플로 같은 용어는 진입·무효화·비용 규칙으로 번역한 뒤 검증합니다.' },
    ],
    reels: reelResearch.map((reel) => ({ ...reel, sourceUrl: createReelUrl(reel.id) })),
  };
}

function loadSource(source) {
  if (!sourceCache.has(source.slug)) sourceCache.set(source.slug, source.load());
  return sourceCache.get(source.slug);
}

function ReelCard({ reel, order, sourceSlug }) {
  const [expanded, setExpanded] = useState(false);
  const detailId = `rs-reel-detail-${sourceSlug}-${reel.id}`;
  const kind = kindById.get(reel.kind);

  return (
    <article className={`rs-reel-card kind-${reel.kind}`}>
      <header><span>REEL {String(order).padStart(3, '0')}</span><time dateTime={reel.date.replaceAll('.', '-')}>{reel.date} · {reel.duration}</time></header>
      <div className="rs-reel-card-body">
        <div className="rs-reel-labels"><span>{kind?.label ?? reel.kind}</span><em className={reel.verdict === '규칙화 가능' ? 'actionable' : ''}>{reel.verdict}</em></div>
        <h2>{reel.title}</h2>
        <small lang="en">{reel.originalTitle}</small>
        <p>{reel.core}</p>
        <div className="rs-tag-row">{reel.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
      </div>
      <button className={`rs-card-toggle ${expanded ? 'open' : ''}`} type="button" onClick={() => setExpanded((open) => !open)} aria-expanded={expanded} aria-controls={detailId}>
        분석 노트 {expanded ? '접기' : '펼치기'} <span>+</span>
      </button>
      {expanded ? (
        <div className="rs-reel-detail" id={detailId}>
          <div><h3>실행·검토 규칙</h3><ol>{reel.rules.map((rule, index) => <li key={`${reel.id}-${index}`}>{rule}</li>)}</ol></div>
          <aside><ShieldAlert size={17} /><p><b>검증 메모</b>{reel.caution}</p></aside>
          <footer><span>분석 근거 <b>{reel.fidelity}</b></span><a href={reel.sourceUrl} target="_blank" rel="noreferrer">원본 영상 <ArrowUpRight size={14} /></a></footer>
        </div>
      ) : null}
    </article>
  );
}

export default function ReelsResearchPage() {
  const [activeSourceSlug, setActiveSourceSlug] = useState(sourceDefinitions[0].slug);
  const [activeSource, setActiveSource] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [activeKind, setActiveKind] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(32);
  const activeSourceDefinition = sourceDefinitionBySlug.get(activeSourceSlug) ?? sourceDefinitions[0];

  useEffect(() => {
    let current = true;
    setLoadError(false);
    loadSource(activeSourceDefinition)
      .then((source) => {
        if (current) setActiveSource(source);
      })
      .catch(() => {
        if (current) setLoadError(true);
      });
    return () => {
      current = false;
    };
  }, [activeSourceDefinition]);

  const isSourceReady = activeSource?.slug === activeSourceSlug;

  const sourceSummary = useMemo(() => {
    const kindCounts = new Map(reelKinds.map((kind) => [kind.id, 0]));
    let actionableCount = 0;
    let noStrategyCount = 0;
    if (!isSourceReady) return { kindCounts, actionableCount, noStrategyCount };
    for (const reel of activeSource.reels) {
      kindCounts.set(reel.kind, (kindCounts.get(reel.kind) ?? 0) + 1);
      if (reel.verdict === '규칙화 가능') actionableCount += 1;
      if (reel.verdict === '전략 아님') noStrategyCount += 1;
    }
    return { kindCounts, actionableCount, noStrategyCount };
  }, [activeSource, isSourceReady]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
    const rows = [];
    if (!isSourceReady) return rows;
    for (let index = 0; index < activeSource.reels.length; index += 1) {
      const reel = activeSource.reels[index];
      if (activeKind !== 'all' && reel.kind !== activeKind) continue;
      if (normalizedQuery) {
        const searchable = [reel.title, reel.originalTitle, reel.core, reel.verdict, ...reel.tags, ...reel.rules].join(' ').toLocaleLowerCase('ko-KR');
        if (!searchable.includes(normalizedQuery)) continue;
      }
      rows.push({ reel, order: index + 1 });
    }
    return rows;
  }, [activeKind, activeSource, isSourceReady, query]);

  const selectSource = (slug) => {
    setActiveSourceSlug(slug);
    setActiveKind('all');
    setQuery('');
    setVisibleCount(32);
  };

  return (
    <>
      <section className="rs-page-hero rs-reels-hero">
        <span className="rs-eyebrow"><i /> SOURCE DECODE / FACEBOOK REELS</span>
        <h1>스크롤을 멈추고,<br /><em>근거를 펼칩니다.</em></h1>
        <p>공개 릴스를 출처별로 전수 확인해 실제 셋업, 리스크 원칙, 심리 조언과 단순 논평을 분리했습니다. 과장된 제목보다 발화 내용과 재현 가능한 조건을 우선합니다.</p>
        <div className="rs-page-stats" aria-label="릴스 분석 범위">
          <span><b>{sourceDefinitions.length}</b><small>SOURCE PAGES</small></span>
          <span><b>{researchStats.reelsAnalyzed.toLocaleString('ko-KR')} / {researchStats.reelsInventory.toLocaleString('ko-KR')}</b><small>ANALYZED / INVENTORY</small></span>
          <span><b>{activeSourceDefinition.totalDuration}</b><small>SELECTED WATCHED</small></span>
        </div>
      </section>

      <div className="rs-catalog-shell">
        <section className="rs-source-index" aria-labelledby="reels-source-title">
          <header><span>RESEARCH INDEX</span><h2 id="reels-source-title">분석 출처 선택</h2></header>
          <div className="rs-source-tabs" role="group" aria-label="릴스 분석 출처">
            {sourceDefinitions.map((source) => (
              <button type="button" key={source.slug} className={activeSourceSlug === source.slug ? 'active' : ''} onClick={() => selectSource(source.slug)} onMouseEnter={() => void loadSource(source).catch(() => {})} onFocus={() => void loadSource(source).catch(() => {})} aria-pressed={activeSourceSlug === source.slug}>
                <span>{source.profileName}</span><b>{source.reelCount}</b>
              </button>
            ))}
          </div>
        </section>

        {!isSourceReady ? (
          <section className="rs-source-loading" aria-live="polite">
            {loadError ? <><ShieldAlert size={22} /><b>데이터를 불러오지 못했습니다.</b><button type="button" onClick={() => { sourceCache.delete(activeSourceSlug); setActiveSource(null); setLoadError(false); loadSource(activeSourceDefinition).then(setActiveSource).catch(() => setLoadError(true)); }}>다시 시도</button></> : <><span className="rs-loading-mark" /><b>{activeSourceDefinition.profileName} 분석 원장을 불러오는 중입니다.</b></>}
          </section>
        ) : <>
        <section className="rs-source-dossier" aria-labelledby="active-reels-source-title">
          <div className="rs-source-copy"><span>PRIMARY SOURCE / PUBLIC PROFILE</span><h2 id="active-reels-source-title">{activeSource.profileName}</h2><p>{activeSource.publishedRange} 공개 릴스 {activeSource.reelCount}편을 {activeSource.analyzedAt} 기준으로 분석했습니다. 원문·전사·화면 맥락을 확인하고 실행 조건이 없는 영상은 전략으로 승격하지 않았습니다.</p><a href={activeSource.canonicalProfileUrl} target="_blank" rel="noreferrer">원본 릴스 탭 <ExternalLink size={14} /></a></div>
          <div className="rs-source-metrics">
            <span><Video size={18} /><b>{activeSource.reelCount}</b><small>분석 완료</small></span>
            <span><BookOpenCheck size={18} /><b>{sourceSummary.actionableCount}</b><small>규칙화 가능</small></span>
            <span><ShieldAlert size={18} /><b>{sourceSummary.noStrategyCount}</b><small>전략 아님</small></span>
          </div>
        </section>

        <section className="rs-principle-grid" aria-label="선택 출처의 공통 원칙">
          {activeSource.commonPrinciples.map((principle, index) => {
            const Icon = principle.icon ?? principleIcons[index % principleIcons.length];
            return <article key={principle.code}><span>{String(index + 1).padStart(2, '0')} / {principle.code}</span><Icon size={20} /><h2>{principle.title}</h2><p>{principle.copy}</p></article>;
          })}
        </section>

        <section className="rs-catalog" aria-labelledby="reels-catalog-title">
          <header className="rs-catalog-heading">
            <div><span>{activeSource.reelCount} / {activeSource.reelCount} SOURCE NOTES</span><h2 id="reels-catalog-title">영상별 분석 원장</h2><p>카드를 펼치면 실행 규칙, 검증 한계와 원본 링크를 확인할 수 있습니다.</p></div>
            <label className="rs-search-field"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(32); }} placeholder="전략·태그·검증 메모 검색" aria-label="릴스 리서치 검색" /></label>
          </header>
          <div className="rs-filter-row">
            <div className="rs-kind-tabs" role="group" aria-label="콘텐츠 유형 필터">
              {reelKinds.map((kind) => (
                <button type="button" key={kind.id} className={activeKind === kind.id ? 'active' : ''} onClick={() => { setActiveKind(kind.id); setVisibleCount(32); }} aria-pressed={activeKind === kind.id}>
                  {kind.label}<span>{kind.id === 'all' ? activeSource.reels.length : sourceSummary.kindCounts.get(kind.id) ?? 0}</span>
                </button>
              ))}
            </div>
            <p><b>{filteredRows.length}</b>개 노트 · {Math.min(visibleCount, filteredRows.length)}개 표시</p>
          </div>

          {filteredRows.length ? (
            <div className="rs-reels-grid">
              {filteredRows.slice(0, visibleCount).map(({ reel, order }) => <ReelCard reel={reel} order={order} sourceSlug={activeSource.slug} key={`${activeSource.slug}-${reel.id}`} />)}
            </div>
          ) : (
            <div className="rs-empty-state"><Search size={22} /><b>일치하는 리서치가 없습니다.</b><p>검색어를 줄이거나 다른 분류를 선택해 보세요.</p></div>
          )}
          {visibleCount < filteredRows.length ? <button className="rs-more-button" type="button" onClick={() => setVisibleCount((count) => count + 32)}>다음 32개 노트 <ArrowDown size={15} /></button> : null}
        </section>

        <section className="rs-method-note"><FlaskConical size={22} /><div><b>콘텐츠 해석 원칙</b><p>릴스에서 소개된 규칙은 연구 가설입니다. 성과 수치가 없는 셋업에는 수익성을 부여하지 않았으며, 실제 적용 전 심볼·세션·수수료·슬리피지·표본 외 구간을 고정한 별도 검증이 필요합니다.</p></div></section>
        </>}
      </div>
    </>
  );
}
