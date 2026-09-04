import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ChevronDown,
  Database,
  ExternalLink,
  FileCheck2,
  RotateCcw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import {
  youtubeResearchAudit,
  youtubeResearchChannels,
  youtubeResearchVideos,
  youtubeVideoKinds,
  youtubeVideoPatterns,
  youtubeVideoThemes,
} from './data/youtube-research-data.js';
import { ScrollTopButton } from './research-ui.jsx';

const channelById = new Map(youtubeResearchChannels.map((channel) => [channel.id, channel]));

function YoutubeCard({ video, order, fresh }) {
  const [expanded, setExpanded] = useState(false);
  const pattern = youtubeVideoPatterns[video.pattern];
  const detailId = `rs-youtube-detail-${video.channelSlug}-${video.id}`;

  return (
    <article
      className={`rs-youtube-card ${expanded ? 'expanded' : ''}`}
      data-fresh={fresh === undefined ? undefined : ''}
      style={fresh === undefined ? undefined : { '--rs-i': Math.min(fresh, 7) }}
    >
      <header>
        <div className="rs-reel-meta">
          <span>VIDEO {String(order).padStart(3, '0')}</span>
          <em className="rs-kind-pill youtube">{video.kind}</em>
        </div>
        <div className="rs-youtube-meta">
          <small>{video.channelName}</small>
          <time dateTime={video.date.replaceAll('.', '-')}>{video.date.replaceAll('.', '/')} · {video.duration}</time>
        </div>
      </header>
      <div className="rs-youtube-card-body">
        <div className="rs-youtube-labels"><span>{video.theme}</span><em>{pattern.label}</em></div>
        <h2>{video.subject}</h2>
        <h3>{video.title}</h3>
        <div><small>핵심 해석</small><p>{video.thesis}</p></div>
        <div className="rs-claim-box"><small>영상이 제시한 근거 · 미검증</small><p>{video.claims}</p></div>
      </div>
      <button className="rs-card-toggle" type="button" onClick={() => setExpanded((open) => !open)} aria-expanded={expanded} aria-controls={detailId}>
        <span>실행·검증 규칙 {expanded ? '접기' : '펼치기'}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div className="rs-detail-wrap" data-open={expanded ? '' : undefined} inert={!expanded}>
        <div className="rs-youtube-detail" id={detailId}>
          <div><small>셋업</small><p>{pattern.setup}</p></div>
          <div><small>진입</small><p>{pattern.entry}</p></div>
          <div><small>청산</small><p>{pattern.exit}</p></div>
          {video.rules?.length ? <div><small>영상별 실행 규칙</small><ul>{video.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div> : null}
          {video.cta && video.cta !== '없음' ? <div><small>CTA</small><p>{video.cta}</p></div> : null}
          <aside><ShieldAlert size={15} /><span><small>이 영상의 검증 포인트</small><p>{video.risk}</p></span></aside>
          <footer><span>분석 근거 <b>{video.transcriptSource}{video.transcriptWordCount ? ` · ${video.transcriptWordCount.toLocaleString('ko-KR')}단어` : ''}</b></span><a href={video.url} target="_blank" rel="noreferrer">원본 영상 <ExternalLink size={13} /></a></footer>
        </div>
      </div>
    </article>
  );
}

export default function YoutubeResearchPage() {
  const [channelId, setChannelId] = useState('all');
  const [kind, setKind] = useState('전체');
  const [theme, setTheme] = useState('전체');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [batchStart, setBatchStart] = useState(-1);

  useEffect(() => {
    if (window.location.hash !== '#all-videos') return undefined;
    const frame = window.requestAnimationFrame(() => document.getElementById('all-videos')?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // a filter change re-mounts the whole list; only a "load more" batch staggers
  useEffect(() => { setBatchStart(-1); }, [channelId, kind, theme, query]);

  const selectedAudit = channelId === 'all' ? youtubeResearchAudit : channelById.get(channelId);

  const filteredVideos = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('ko-KR');
    const videos = [];
    for (const video of youtubeResearchVideos) {
      if (channelId !== 'all' && video.channelId !== channelId) continue;
      if (kind !== '전체' && video.kind !== kind) continue;
      if (theme !== '전체' && video.theme !== theme) continue;
      if (keyword) {
        const searchable = [video.channelName, video.subject, video.title, video.theme, video.thesis, video.claims, video.risk, video.id].join(' ').toLocaleLowerCase('ko-KR');
        if (!searchable.includes(keyword)) continue;
      }
      videos.push(video);
    }
    return videos.toSorted((left, right) => {
      const dateOrder = right.date.localeCompare(left.date);
      if (dateOrder) return dateOrder;
      if (left.kind === 'Shorts' && right.kind !== 'Shorts') return 1;
      if (right.kind === 'Shorts' && left.kind !== 'Shorts') return -1;
      return right.duration.localeCompare(left.duration);
    });
  }, [channelId, kind, query, theme]);

  const resetFilters = () => {
    setChannelId('all');
    setKind('전체');
    setTheme('전체');
    setQuery('');
    setVisibleCount(24);
  };

  const selectChannel = (event) => {
    setChannelId(event.target.value);
    setKind('전체');
    setTheme('전체');
    setVisibleCount(24);
  };

  const filtersActive = channelId !== 'all' || kind !== '전체' || theme !== '전체' || query;

  return (
    <>
      <section className="rs-page-hero rs-youtube-hero">
        <span className="rs-eyebrow"><i /> CHANNEL AUDIT / YOUTUBE</span>
        <h1>채널 전체를 보고,<br /><em>한 편씩 검증합니다.</em></h1>
        <p>공개 영상 전체를 제목·설명·자막과 대조하고 클릭베이트를 제거한 핵심 논리, 실행 규칙과 검증 포인트로 다시 편집했습니다.</p>
        <div className="rs-page-stats" aria-label="유튜브 분석 범위">
          <span><b>{youtubeResearchChannels.length}</b><small>CHANNELS</small></span>
          <span><b>{youtubeResearchAudit.publicVideos} / {youtubeResearchAudit.publicVideos}</b><small>PUBLIC COVERAGE</small></span>
          <span><b>0</b><small>INCOMPLETE ACCESS</small></span>
        </div>
      </section>

      <div className="rs-catalog-shell rs-youtube-shell">
        <section className="rs-channel-ledger" aria-label="유튜브 채널별 분석 현황">
          <header><span>CHANNEL LEDGER</span><h2>분석 대상 채널</h2><p>각 채널의 공개 목록 기준 커버리지입니다.</p></header>
          <div>
            {youtubeResearchChannels.map((channel, index) => (
              <button type="button" key={channel.id} className={channelId === channel.id ? 'active' : ''} onClick={() => { setChannelId(channel.id); setKind('전체'); setTheme('전체'); setVisibleCount(24); }} aria-pressed={channelId === channel.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{channel.name}</b>
                <small>{channel.longForm} LONG · {channel.shorts} SHORTS</small>
                <em>{channel.publicVideos} / {channel.publicVideos}</em>
              </button>
            ))}
          </div>
        </section>

        <section className="rs-youtube-audit" aria-label="선택한 유튜브 분석 범위">
          <div className="rs-audit-stamp"><FileCheck2 size={21} /><span><small>PUBLIC COVERAGE</small><b>{selectedAudit.publicVideos} / {selectedAudit.publicVideos}</b></span></div>
          <dl>
            <div><dt>LONG FORM</dt><dd>{selectedAudit.longForm}</dd></div>
            <div><dt>SHORTS</dt><dd>{selectedAudit.shorts}</dd></div>
            <div><dt>TRANSCRIPT</dt><dd>{selectedAudit.captioned}</dd></div>
            <div><dt>{channelId === 'all' ? 'CHANNELS' : 'CHANNEL LABEL'}</dt><dd>{channelId === 'all' ? youtubeResearchChannels.length : selectedAudit.channelReported}</dd></div>
          </dl>
          <p><Database size={15} /><span>{selectedAudit.note}</span></p>
        </section>

        <section className="rs-catalog rs-youtube-catalog" id="all-videos" aria-labelledby="youtube-catalog-title">
          <header className="rs-catalog-heading">
            <div><span>06 / ALL VIDEOS · {youtubeResearchAudit.publicVideos} / {youtubeResearchAudit.publicVideos} PUBLIC NOTES</span><h2 id="youtube-catalog-title">영상 분석 원장</h2><p>채널·유형·테마를 조합하거나 영상 ID와 검증 메모까지 검색할 수 있습니다.</p></div>
          </header>
          <div className="rs-catalog-toolbar rs-youtube-toolbar">
            <label className="rs-search-field"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(24); }} placeholder="채널·전략·근거·영상 ID 검색" aria-label="유튜브 분석 검색" /></label>
            <label className="rs-select"><span>채널</span><select value={channelId} onChange={selectChannel} aria-label="유튜브 채널"><option value="all">전체</option>{youtubeResearchChannels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</select></label>
            <label className="rs-select"><span>유형</span><select value={kind} onChange={(event) => { setKind(event.target.value); setVisibleCount(24); }} aria-label="영상 유형">{youtubeVideoKinds.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="rs-select"><span>테마</span><select value={theme} onChange={(event) => { setTheme(event.target.value); setVisibleCount(24); }} aria-label="영상 테마">{youtubeVideoThemes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <p className="rs-result-count"><b>{filteredVideos.length}</b>편 검색됨 · {Math.min(visibleCount, filteredVideos.length)}편 표시</p>
            {filtersActive ? <button type="button" className="rs-reset-button" onClick={resetFilters}>초기화 <RotateCcw size={13} /></button> : <span className="rs-sort-hint">NEWEST → OLDEST</span>}
          </div>

          {filteredVideos.length ? (
            <div className="rs-youtube-grid">
              {filteredVideos.slice(0, visibleCount).map((video, index) => (
                <YoutubeCard
                  video={video}
                  order={index + 1}
                  fresh={batchStart >= 0 && index >= batchStart ? index - batchStart : undefined}
                  key={`${video.channelSlug}-${video.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="rs-empty-state"><Search size={22} /><b>일치하는 영상이 없습니다.</b><p>검색어를 줄이거나 다른 분류를 선택해 보세요.</p></div>
          )}
          {visibleCount < filteredVideos.length ? <button className="rs-more-button" type="button" onClick={() => { setBatchStart(visibleCount); setVisibleCount((count) => count + 24); }}>다음 24편 더 보기 <ArrowDown size={15} /></button> : null}
        </section>
      </div>
      <ScrollTopButton />
    </>
  );
}
