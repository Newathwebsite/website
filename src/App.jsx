import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { captureUtmParams } from './lib/utm';

import NotFound from './pages/site/NotFound';
import FeathersLanding from './pages/site/feathers/FeathersLanding';
import ProjectDetail2 from './pages/site/ath2/ProjectDetail2';
import LandingPage2, { LandingPageBody } from './pages/site/ath2/LandingPage2';

import Layout2 from './pages/site/ath2/Layout2';
import Home2 from './pages/site/ath2/Home2';
import About2 from './pages/site/ath2/About2';
import WhyAth2 from './pages/site/ath2/WhyAth2';
import Apartments2 from './pages/site/ath2/Apartments2';
import Villas2 from './pages/site/ath2/Villas2';
import Nri2 from './pages/site/ath2/Nri2';
import ChannelPartner2 from './pages/site/ath2/ChannelPartner2';
import Careers2 from './pages/site/ath2/Careers2';
import Testimonials2 from './pages/site/ath2/Testimonials2';
import NewsEvents2 from './pages/site/ath2/NewsEvents2';
import Contact2 from './pages/site/ath2/Contact2';
import PrivacyPolicy2 from './pages/site/ath2/PrivacyPolicy2';
import BlogList2 from './pages/site/ath2/BlogList2';
import BlogPost2 from './pages/site/ath2/BlogPost2';
import GenericPage2 from './pages/site/ath2/GenericPage2';

import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProjectsAdmin from './pages/admin/ProjectsAdmin';
import ProjectEditor from './pages/admin/ProjectEditor';
import PagesAdmin from './pages/admin/PagesAdmin';
import PageEditor from './pages/admin/PageEditor';
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin';
import NewsEventsAdmin from './pages/admin/NewsEventsAdmin';
import CareersAdmin from './pages/admin/CareersAdmin';
import BlogAdmin from './pages/admin/BlogAdmin';
import BlogEditor from './pages/admin/BlogEditor';
import MediaAdmin from './pages/admin/MediaAdmin';
import FormsAdmin from './pages/admin/FormsAdmin';
import FormEditor from './pages/admin/FormEditor';
import UsersAdmin from './pages/admin/UsersAdmin';
import AuditAdmin from './pages/admin/AuditAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import LandingPagesAdmin from './pages/admin/LandingPagesAdmin';
import LandingPageEditor from './pages/admin/LandingPageEditor';
import PushAdmin from './pages/admin/PushAdmin';
import HomePageAdmin from './pages/admin/HomePageAdmin';
import TrashAdmin from './pages/admin/TrashAdmin';

// If a landing page has a `subdomain` set and the browser's current hostname
// matches it exactly, serve that landing page for every path on this host —
// no site chrome, same as visiting /lp/<slug> directly. This only works once
// that subdomain's DNS/hosting is pointed at this same deployed app; this
// code can't provision the subdomain or DNS record itself.
function useSubdomainLandingPage() {
  const { landingPages } = useData();
  const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  return landingPages.find((p) => p.published && p.subdomain && p.subdomain.trim().toLowerCase() === host);
}

// Set via .env.public / .env.admin (see vite.config.js + package.json's
// build:public / build:admin scripts). Unset in plain `npm run dev` or
// `npm run build`, which keeps both route trees mounted together exactly as
// before the split — that stays the default so local dev doesn't need a
// --mode flag to exercise the whole app.
const BUILD_TARGET = import.meta.env.VITE_BUILD_TARGET;

function publicRoutes() {
  return (
    <>
      {/* ATH Feathers is a standalone paid-traffic landing page — no site
          chrome of its own accord, matching the original production page. */}
      <Route path="/projects/ath-feathers" element={<FeathersLanding />} />

      {/* Standalone campaign landing pages built in Admin → Landing Pages. */}
      <Route path="/lp/:slug" element={<LandingPage2 />} />

      {/* Main corporate site — real navy/gold Asset Tree Homes design. */}
      <Route element={<Layout2 />}>
        <Route path="/" element={<Home2 />} />
        <Route path="/about" element={<About2 />} />
        <Route path="/why-ath" element={<WhyAth2 />} />
        <Route path="/apartments" element={<Apartments2 />} />
        <Route path="/villas" element={<Villas2 />} />
        <Route path="/nri" element={<Nri2 />} />
        <Route path="/channel-partner" element={<ChannelPartner2 />} />
        <Route path="/careers" element={<Careers2 />} />
        <Route path="/testimonials" element={<Testimonials2 />} />
        <Route path="/news-events" element={<NewsEvents2 />} />
        <Route path="/blog" element={<BlogList2 />} />
        <Route path="/blog/:slug" element={<BlogPost2 />} />
        <Route path="/contact" element={<Contact2 />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy2 />} />
        <Route path="/projects/:slug" element={<ProjectDetail2 />} />
        <Route path="/:slug" element={<GenericPage2 />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  );
}

function adminRoutes() {
  return (
    <>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="home-page" element={<HomePageAdmin />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="projects/:id" element={<ProjectEditor />} />
        <Route path="pages" element={<PagesAdmin />} />
        <Route path="pages/:slug" element={<PageEditor />} />
        <Route path="landing-pages" element={<LandingPagesAdmin />} />
        <Route path="landing-pages/:id" element={<LandingPageEditor />} />
        <Route path="blog" element={<BlogAdmin />} />
        <Route path="blog/:id" element={<BlogEditor />} />
        <Route path="testimonials" element={<TestimonialsAdmin />} />
        <Route path="news-events" element={<NewsEventsAdmin />} />
        <Route path="careers" element={<CareersAdmin />} />
        <Route path="media" element={<MediaAdmin />} />
        <Route path="push" element={<PushAdmin />} />
        <Route path="forms" element={<FormsAdmin />} />
        <Route path="forms/:id" element={<FormEditor />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="audit" element={<AuditAdmin />} />
        <Route path="trash" element={<TrashAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>
    </>
  );
}

function AppRoutes() {
  // Called unconditionally (Rules of Hooks) even on the admin build, where
  // its result is simply unused — DataProvider still loads landingPages
  // either way.
  const subdomainPage = useSubdomainLandingPage();

  if (BUILD_TARGET === 'admin') {
    return (
      <Routes>
        {/* The admin bundle is deployed at its own subdomain root, so send a
            bare visit straight into the app instead of a dead "/" route. */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        {adminRoutes()}
      </Routes>
    );
  }

  if (subdomainPage) return <LandingPageBody page={subdomainPage} />;

  if (BUILD_TARGET === 'public') {
    return <Routes>{publicRoutes()}</Routes>;
  }

  // No VITE_BUILD_TARGET set — unified dev/default build, both trees mounted
  // together exactly as before this split existed.
  return (
    <Routes>
      {publicRoutes()}
      {adminRoutes()}
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </AuthProvider>
  );
}
