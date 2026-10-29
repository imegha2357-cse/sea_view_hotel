import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import { RequireAdmin, RequireGuest } from './components/Guards';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import RoomTour from './pages/RoomTour';
import RoomsPage from './pages/RoomsPage';
import RoomDetail from './pages/RoomDetail';
import Meetings from './pages/Meetings';
import Policies from './pages/Policies';
import PlanVisit from './pages/PlanVisit';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import AdminLogin from './pages/admin/AdminLogin';
import CookieConsent from './components/CookieConsent';
import { IntroProvider } from './components/Intro';
import { initSmoothScroll } from './lib/scroll';

// Dashboards load only when someone signs in, keeping the public page light.
const Account = lazy(() => import('./pages/account/Account'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function Site({ children }) {
  useEffect(() => initSmoothScroll(), []);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      {children}
      <Footer />
      <FloatingActions />
    </>
  );
}

// #99 page transition: short crossfade between routes
function Page({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    // reducedMotion="user" turns movement into simple fades for people who ask for reduced motion
    <MotionConfig reducedMotion="user">
      <IntroProvider>
      <AnimatePresence mode="wait">
        <Suspense fallback={null}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Site><Home /></Site></Page>} />
            <Route path="/rooms" element={<Page><Site><RoomsPage /></Site></Page>} />
            <Route path="/rooms/:id" element={<Page><Site><RoomDetail /></Site></Page>} />
            <Route path="/meetings" element={<Page><Site><Meetings /></Site></Page>} />
            <Route path="/policies" element={<Page><Site><Policies /></Site></Page>} />
            <Route path="/plan-your-visit" element={<Page><Site><PlanVisit /></Site></Page>} />
            <Route path="/room-tour" element={<Page><Site><RoomTour /></Site></Page>} />
            <Route path="/privacy" element={<Page><Site><Privacy /></Site></Page>} />
            <Route path="/login" element={<Page><Login /></Page>} />
            <Route path="/account" element={<Page><RequireGuest><Account /></RequireGuest></Page>} />
            <Route path="/admin/login" element={<Page><AdminLogin /></Page>} />
            <Route path="/admin" element={<Page><RequireAdmin><AdminDashboard /></RequireAdmin></Page>} />
            <Route path="*" element={<Page><Site><NotFound /></Site></Page>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <CookieConsent />
      </IntroProvider>
    </MotionConfig>
  );
}
