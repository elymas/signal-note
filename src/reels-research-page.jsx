import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FlaskConical,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Video,
} from 'lucide-react';
import { researchStats } from './research-constants';
import { reelsArchiveNotes, reelsSources, reelsSourcesBySlug } from './data/reels-sources.js';
import { ScrollTopButton, summarizeReelDurations } from './research-ui.jsx';

const reelKinds = [
  { id: 'all', label: '전체' },
  { id: 'setup', label: '셋업' },
  { id: 'risk', label: '리스크' },
  { id: 'psychology', label: '심리·규율' },
  { id: 'commentary', label: '사례·논평' },
];
const kindById = new Map(reelKinds.map((kind) => [kind.id, kind]));
const principleIcons = [ShieldAlert, SlidersHorizontal, CheckCircle2, FlaskConical];

const verdictTone = {
  '규칙화 가능': 'go',
  '검증 필요': 'verify',
  '전략 아님': 'none',
  '핵심 원칙': 'principle',
  '주의 필요': 'warn',
};

const sourceCache = new Map();

function loadSource(source) {
  if (!sourceCache.has(source.slug)) sourceCache.set(source.slug, source.load());
  return sourceCache.get(source.slug);
}

function ReelCard({ reel, order, sourceSlug, fresh }) {
  const [expanded, setExpanded] = useState(false);
  const detailId = `rs-reel-detail-${sourceSlug}-${reel.id}`;
  const kind = kindById.get(reel.kind);
  const tone = verdictTone[reel.verdict] ?? 'verify';

  return (
    <article
      className={`rs-reel-card kind-${reel.kind} ${expanded ? 'expanded' : ''}`}
      data-fresh={fresh === undefined ? undefined : ''}
      style={fresh === undefined ? undefined : { '--rs-i': Math.min(fresh, 7) }}
    >
      <header>
        <div className="rs-reel-meta">
          <span>REEL {String(order).padStart(3, '0')}</span>
          <em className={`rs-kind-pill kind-${reel.kind}`}>{kind?.label ?? reel.kind}</em>
        </div>
        <time dateTime={reel.date.replaceAll('.', '-')}>{reel.date} · {reel.duration}</time>
      </header>
      <div className="rs-reel-card-body">
        <h2>{reel.title}</h2>
        <small lang="en">{reel.originalTitle}</small>
        <p>{reel.core}</p>
        <div className="rs-reel-foot">
          <em className={`rs-verdict ${tone}`}>{reel.verdict}</em>
          <div className="rs-tag-row">{reel.tags.slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}</div>
        </div>
      </div>
      <button className="rs-card-toggle" type="button" onClick={() => setExpanded((open) => !open)} aria-expanded={expanded} aria-controls={detailId}>
        <span>분석 노트 {expanded ? '접기' : '펼치기'}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div className="rs-detail-wrap" data-open={expanded ? '' : undefined} inert={!expanded}>
        <div className="rs-reel-detail" id={detailId}>
          <div><h3>실행·검토 규칙</h3><ol>{reel.rules.map((rule, index) => <li key={`${reel.id}-${index}`}>{rule}</li>)}</ol></div>
          {reel.cta ? <div><h3>CTA</h3><p>{reel.cta}</p></div> : null}
          <aside><ShieldAlert size={17} /><p><b>검증 메모</b>{reel.caution}</p></aside>
          <footer><span>분석 근거 <b>{reel.fidelity}{Number.isFinite(reel.transcriptWordCount) ? ` · ${reel.transcriptWordCount.toLocaleString('ko-KR')}단어` : ''}</b></span><a href={reel.sourceUrl} target="_blank" rel="noreferrer">원본 영상 <ArrowUpRight size={14} /></a></footer>
        </div>
      </div>
    </article>
  );
}

function ReelSkeleton() {
  return (
    <div className="rs-reel-card rs-skeleton" aria-hidden="true">
      <header><span className="bar w-24" /><span className="bar w-16" /></header>
      <div className="rs-reel-card-body">
        <span className="bar w-90" />
        <span className="bar w-70 dim" />
        <span className="bar w-100" />
        <span className="bar w-85 dim" />
        <span className="bar w-40" />
      </div>
      <footer><span className="bar w-32" /></footer>
    </div>
  );
}

export default function ReelsResearchPage() {
  const [activeSourceSlug, setActiveSourceSlug] = useState(reelsSources[0].slug);
  const [activeSource, setActiveSource] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [activeKind, setActiveKind] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [batchStart, setBatchStart] = useState(-1);
  const activeSourceDefinition = reelsSourcesBySlug.get(activeSourceSlug) ?? reelsSources[0];

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

  // a filter change re-mounts the whole list; only a "load more" batch staggers
  useEffect(() => { setBatchStart(-1); }, [activeSourceSlug, activeKind, query]);

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
    setVisibleCount(24);
  };

  const retryLoad = () => {
    sourceCache.delete(activeSourceSlug);
    setActiveSource(null);
    setLoadError(false);
    loadSource(activeSourceDefinition).then(setActiveSource).catch(() => setLoadError(true));
  };

  const watchedLabel = isSourceReady ? summarizeReelDurations(activeSource.reels) : '···';

  return (
    <>
      <section className="rs-page-hero rs-reels-hero">
        <span className="rs-eyebrow"><i /> SOURCE DECODE / FACEBOOK REELS</span>
        <h1>스크롤을 멈추고,<br /><em>근거를 펼칩니다.</em></h1>
        <p>공개 릴스를 출처별로 전수 확인해 실제 셋업, 리스크 원칙, 심리 조언과 단순 논평을 분리했습니다. 과장된 제목보다 발화 내용과 재현 가능한 조건을 우선합니다.</p>
        <div className="rs-page-stats" aria-label="릴스 분석 범위">
          <span><b>{reelsSources.length}</b><small>SOURCE PAGES</small></span>
          <span><b>{reelsArchiveNotes.toLocaleString('ko-KR')}</b><small>ARCHIVE NOTES</small></span>
          <span><b>{researchStats.reelsAnalyzed.toLocaleString('ko-KR')} / {researchStats.reelsInventory.toLocaleString('ko-KR')}</b><small>AUDITED / INVENTORY</small></span>
        </div>
      </section>

      <div className="rs-catalog-shell">
        <section className="rs-source-index" aria-labelledby="reels-source-title">
          <header><span>RESEARCH INDEX</span><h2 id="reels-source-title">분석 출처 선택</h2></header>
          <div className="rs-source-tabs" role="group" aria-label="릴스 분석 출처">
            {reelsSources.map((source) => (
              <button type="button" key={source.slug} className={activeSourceSlug === source.slug ? 'active' : ''} onClick={() => selectSource(source.slug)} onMouseEnter={() => void loadSource(source).catch(() => {})} onFocus={() => void loadSource(source).catch(() => {})} aria-pressed={activeSourceSlug === source.slug}>
                <span>{source.profileName}</span>
                <b>{(isSourceReady && source.slug === activeSourceSlug ? activeSource.reels.length : source.notes).toLocaleString('ko-KR')}</b>
              </button>
            ))}
          </div>
        </section>

        {!isSourceReady ? (
          <section className="rs-source-loading" aria-live="polite">
            {loadError ? <><ShieldAlert size={22} /><b>데이터를 불러오지 못했습니다.</b><button type="button" onClick={retryLoad}>다시 시도</button></> : (
              <>
                <div className="rs-loading-head"><span className="rs-loading-mark" /><b>{activeSourceDefinition.profileName} 분석 원장을 불러오는 중입니다.</b></div>
                <div className="rs-skeleton-grid">
                  <ReelSkeleton /><ReelSkeleton /><ReelSkeleton /><ReelSkeleton />
                </div>
              </>
            )}
          </section>
        ) : <>
        <section className="rs-source-dossier" aria-labelledby="active-reels-source-title">
          <div className="rs-source-copy">
            <span>PRIMARY SOURCE / PUBLIC PROFILE</span>
            <h2 id="active-reels-source-title">{activeSource.profileName}</h2>
            <p>{activeSource.publishedRange} 공개 릴스 {activeSource.reels.length.toLocaleString('ko-KR')}편을 {activeSource.analyzedAt} 기준으로 분석했습니다. 원문·전사·화면 맥락을 확인하고 실행 조건이 없는 영상은 전략으로 승격하지 않았습니다.</p>
            <a href={activeSource.canonicalProfileUrl} target="_blank" rel="noreferrer">원본 릴스 탭 <ExternalLink size={14} /></a>
          </div>
          <div className="rs-source-metrics">
            <span><Video size={18} /><b>{activeSource.reels.length.toLocaleString('ko-KR')}</b><small>분석 완료</small></span>
            <span><BookOpenCheck size={18} /><b>{sourceSummary.actionableCount.toLocaleString('ko-KR')}</b><small>규칙화 가능</small></span>
            <span><ShieldAlert size={18} /><b>{sourceSummary.noStrategyCount.toLocaleString('ko-KR')}</b><small>전략 아님</small></span>
            <span><FlaskConical size={18} /><b>{watchedLabel}</b><small>총 재생 시간</small></span>
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
            <div>
              <span>{activeSource.reels.length.toLocaleString('ko-KR')} / {activeSource.reels.length.toLocaleString('ko-KR')} SOURCE NOTES</span>
              <h2 id="reels-catalog-title">영상별 분석 원장</h2>
              <p>카드를 펼치면 실행 규칙, 검증 한계와 원본 링크를 확인할 수 있습니다.</p>
            </div>
          </header>
          <div className="rs-catalog-toolbar" role="search">
            <label className="rs-search-field"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(24); }} placeholder="전략·태그·검증 메모 검색" aria-label="릴스 리서치 검색" /></label>
            <div className="rs-kind-tabs" role="group" aria-label="콘텐츠 유형 필터">
              {reelKinds.map((kind) => (
                <button type="button" key={kind.id} className={activeKind === kind.id ? 'active' : ''} onClick={() => { setActiveKind(kind.id); setVisibleCount(24); }} aria-pressed={activeKind === kind.id}>
                  {kind.label}<span>{kind.id === 'all' ? activeSource.reels.length : sourceSummary.kindCounts.get(kind.id) ?? 0}</span>
                </button>
              ))}
            </div>
            <p className="rs-result-count"><b>{filteredRows.length.toLocaleString('ko-KR')}</b>개 노트 · {Math.min(visibleCount, filteredRows.length).toLocaleString('ko-KR')}개 표시</p>
          </div>

          {filteredRows.length ? (
            <div className="rs-reels-grid">
              {filteredRows.slice(0, visibleCount).map(({ reel, order }, index) => (
                <ReelCard
                  reel={reel}
                  order={order}
                  sourceSlug={activeSource.slug}
                  fresh={batchStart >= 0 && index >= batchStart ? index - batchStart : undefined}
                  key={`${activeSource.slug}-${reel.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="rs-empty-state"><Search size={22} /><b>일치하는 리서치가 없습니다.</b><p>검색어를 줄이거나 다른 분류를 선택해 보세요.</p></div>
          )}
          {visibleCount < filteredRows.length ? <button className="rs-more-button" type="button" onClick={() => { setBatchStart(visibleCount); setVisibleCount((count) => count + 24); }}>다음 24개 노트 <ArrowDown size={15} /></button> : null}
        </section>

        <section className="rs-method-note"><FlaskConical size={22} /><div><b>콘텐츠 해석 원칙</b><p>릴스에서 소개된 규칙은 연구 가설입니다. 성과 수치가 없는 셋업에는 수익성을 부여하지 않았으며, 실제 적용 전 심볼·세션·수수료·슬리피지·표본 외 구간을 고정한 별도 검증이 필요합니다.</p></div></section>
        </>}
      </div>
      <ScrollTopButton />
    </>
  );
}
