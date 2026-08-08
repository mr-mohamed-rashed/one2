/* eslint-disable react-refresh/only-export-components */
import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { useAnalytics } from './hooks/useAnalytics';
import { useAuth } from './hooks/useAuth';
import Index from './pages/Index';
import LeagueHome from './pages/LeagueHome';
import WorldCupArchive from './pages/WorldCupArchive';
import NotFound from './pages/NotFound';
import WorldCupNews from './pages/WorldCupNews';
import NewsArticle from './pages/NewsArticle';
import Standings from './pages/Standings';
import LiveMatches from './pages/LiveMatches';
import Results from './pages/Results';
import Groups from './pages/Groups';
import Admin from './pages/Admin';
import Roadmap from './pages/Roadmap';
import { GlobalFloatingAd } from './components/one2/GlobalFloatingAd';
import { GoogleAuthGate } from './components/one2/GoogleAuthGate';
import { PwaInstallPrompt } from './components/one2/PwaInstallPrompt';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Transfers from './pages/Transfers';

const Layout = () => {
  const location = useLocation();
  useAnalytics();
  const { user, loading, signInWithGoogle } = useAuth();
  const protectedRoutes = ['/live', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

  const handleInterceptClick = (e: React.MouseEvent) => {
    if (!loading && !user) {
      e.preventDefault();
      e.stopPropagation();
      signInWithGoogle();
    }
  };

  if (!isProtectedRoute) {
    return (
      <div>
        <ScrollRestoration />
        <Outlet />
        <GlobalFloatingAd />
        <PwaInstallPrompt />
      </div>
    );
  }

  return (
    <GoogleAuthGate
      autoStart={false}
      title="سجل دخولك لمتابعة وان تو"
      description="أي تنقل داخل الموقع (أخبار، مباريات، إحصائيات) يحتاج تسجيل دخول مجاني بحساب Google لحفظ تجربتك."
    >
      <ScrollRestoration />
      <Outlet />
      <GlobalFloatingAd />
      <PwaInstallPrompt />
    </GoogleAuthGate>
  );
};

export const routers = [
  {
    element: <Layout />,
    children: [
      { path: '/', name: 'home', element: <Index /> },
      { path: '/league/:leagueId', name: 'league', element: <LeagueHome /> },
      { path: '/world-cup', name: 'worldCup', element: <WorldCupArchive /> },
      { path: '/news', name: 'news', element: <WorldCupNews /> },
      { path: '/news/sports/:postId', name: 'newsArticle', element: <NewsArticle /> },
      { path: '/groups', name: 'groups', element: <Groups /> },
      { path: '/roadmap', name: 'roadmap', element: <Roadmap /> },
      { path: '/standings', name: 'standings', element: <Standings /> },
      { path: '/live', name: 'live', element: <LiveMatches /> },
      { path: '/results', name: 'results', element: <Results /> },
      { path: '/admin', name: 'admin', element: <Admin /> },
      { path: '/transfers', name: 'transfers', element: <Transfers /> },
      { path: '/terms-of-service', name: 'terms', element: <TermsOfService /> },
      { path: '/privacy-policy', name: 'privacy', element: <PrivacyPolicy /> },
      { path: '*', name: '404', element: <NotFound /> },
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
