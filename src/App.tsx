import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UIKitPage } from './pages/UIKitPage';
import { PrototypeProvider } from './hooks/PrototypeContext';
import { MobileHomePage, ExplorePage } from './pages/MobileHomePage';
import {
  SearchPage,
  DetailPage,
  GuidePage,
  PatternsPage,
  NotFoundPage,
} from './pages/PrototypePages';
import { ScenarioMapPage } from './pages/ScenarioMapPage';
import { trackScenarioScreen } from './analytics/metrika';
export default function App() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = pathname === '/ui' ? 'Циан · UI kit' : 'Циан · Прототипы';
    const screen =
      pathname === '/'
        ? new URLSearchParams(search).get('user') === 'returning'
          ? 'home_returning'
          : 'home'
        : pathname.startsWith('/explore')
          ? 'vertical'
          : pathname.split('/')[1] || 'home';
    trackScenarioScreen(screen);
  }, [pathname, search]);
  return (
    <PrototypeProvider>
      <Routes>
        <Route path="/" element={<MobileHomePage />} />
        <Route path="/explore/:vertical" element={<ExplorePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listing/:id" element={<DetailPage />} />
        <Route path="/ui" element={<UIKitPage prototype />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/map" element={<ScenarioMapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PrototypeProvider>
  );
}
