import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ResearchShell } from './research-shell';
import { ResearchHomePage } from './research-home-page';

const ReelsResearchPage = lazy(() => import('./reels-research-page'));
const YoutubeResearchPage = lazy(() => import('./youtube-research-page'));

function RouteLoader() {
  return (
    <div className="rs-route-loader" role="status" aria-live="polite">
      <span /><b>RESEARCH ARCHIVE LOADING</b><small>데이터 인덱스를 여는 중입니다.</small>
    </div>
  );
}

export default function ResearchApp() {
  return (
    <ResearchShell>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<ResearchHomePage />} />
          <Route path="/reels" element={<ReelsResearchPage />} />
          <Route path="/youtube" element={<YoutubeResearchPage />} />
          <Route path="/reels-research" element={<Navigate to="/reels" replace />} />
          <Route path="/youtube-research" element={<Navigate to="/youtube" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ResearchShell>
  );
}
