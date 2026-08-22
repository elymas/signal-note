import { useEffect, useState } from 'react';
import { ArrowRight, Menu, Moon, ShieldAlert, Sun, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { researchStats } from './research-constants';

const THEME_KEY = 'sn-theme';

function getTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* 저장 실패는 무시한다 */
    }
  };

  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="rs-theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 테마로 전환' : '다크 테마로 전환'}
      title={isDark ? '라이트 테마로 전환' : '다크 테마로 전환'}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function ResearchLogo({ compact = false }) {
  return (
    <Link className={`rs-brand ${compact ? 'compact' : ''}`} to="/" aria-label="SIGNAL NOTE RESEARCH 홈">
      <span className="rs-brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span><b>SIGNAL<em>/</em>NOTE</b><small>VIDEO EVIDENCE ARCHIVE</small></span>
      {compact ? null : <strong>RESEARCH</strong>}
    </Link>
  );
}

export function ResearchShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="rs-app-shell">
      <div className="rs-tape" aria-label="리서치 데이터 현황">
        <div>
          <span>SOURCE MODE <b>PUBLIC</b></span>
          <span>REELS <b>{researchStats.reelsAnalyzed.toLocaleString('ko-KR')} / {researchStats.reelsInventory.toLocaleString('ko-KR')}</b></span>
          <span>YOUTUBE <b>{researchStats.youtubeVideos} / {researchStats.youtubeVideos}</b></span>
          <span>ACCESS BLOCK <b>{researchStats.restrictedVideos}</b></span>
          <span>AUDITED <b>{researchStats.auditedAt}</b></span>
        </div>
      </div>
      <header className="rs-site-header">
        <ResearchLogo />
        <nav className={menuOpen ? 'open' : ''} aria-label="주요 메뉴">
          <NavLink to="/" end>아카이브 홈</NavLink>
          <NavLink to="/reels">릴스 리서치</NavLink>
          <NavLink to="/youtube">유튜브 분석</NavLink>
          <Link className="rs-nav-cta" to="/reels">리서치 열기 <ArrowRight size={15} /></Link>
        </nav>
        <div className="rs-header-actions">
          <ThemeToggle />
          <Link className="rs-header-cta" to="/reels">리서치 열기 <ArrowRight size={15} /></Link>
          <button type="button" className="rs-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="rs-site-footer">
        <div className="rs-footer-lead">
          <ResearchLogo compact />
          <p>영상의 서사를 줄이고,<br />검증 가능한 조건을 남깁니다.</p>
        </div>
        <div className="rs-footer-links">
          <div><b>ARCHIVE</b><Link to="/reels">릴스 리서치</Link><Link to="/youtube">유튜브 분석</Link></div>
          <div><b>STANDARD</b><span>원본 링크 보존</span><span>주장·검증 분리</span><span>접근 상태 감사</span></div>
        </div>
        <div className="rs-footer-risk"><ShieldAlert size={18} /><p>모든 분석은 교육·정보 제공 목적이며 투자 자문이나 수익 보장이 아닙니다. 영상의 성과 수치는 독립 검증 전까지 원 제작자의 주장으로만 취급합니다.</p></div>
        <small>© 2026 SIGNAL NOTE RESEARCH · EVIDENCE BEFORE CONVICTION</small>
      </footer>
    </div>
  );
}
