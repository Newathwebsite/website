import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ConfirmProvider } from './ConfirmProvider';

const NAV = [
  { to: '/admin', label: '📊 Dashboard', end: true, resource: null },
  { to: '/admin/home-page', label: '🏠 Home Page', resource: 'homePage' },
  { to: '/admin/projects', label: '🏘️ Projects', resource: 'projects' },
  { to: '/admin/pages', label: '📄 Pages', resource: 'pages' },
  { to: '/admin/landing-pages', label: '🚀 Landing Pages', resource: 'landingPages' },
  { to: '/admin/blog', label: '📝 Blog', resource: 'blog' },
  { to: '/admin/testimonials', label: '💬 Testimonials', resource: 'testimonials' },
  { to: '/admin/news-events', label: '📰 News & Events', resource: 'newsEvents' },
  { to: '/admin/careers', label: '💼 Job Openings', resource: 'careers' },
  { to: '/admin/media', label: '🖼️ Media Library', resource: 'media' },
  { to: '/admin/push', label: '🔔 Push Notifications', resource: 'push' },
  { to: '/admin/forms', label: '🧾 Enquiry Forms', resource: 'forms' },
  { to: '/admin/audit', label: '✅ Site Audit', resource: null },
  { to: '/admin/trash', label: '🗑️ Trash', resource: null },
  { to: '/admin/users', label: '👤 Users', resource: 'users' },
  { to: '/admin/settings', label: '⚙️ Settings', resource: 'settings' },
];

export default function AdminLayout() {
  const { logout, currentUser, can } = useAuth();

  return (
    <div className="admin-scope a-app">
      <aside className="a-sidebar">
        <div className="a-brand">ATH Content Admin</div>
        <div className="a-site">{currentUser?.username} · {currentUser?.role}</div>
        <nav>
          {NAV.filter((n) => !n.resource || can(n.resource, 'view')).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
          <NavLink to="/" className="">🌐 View Site</NavLink>
        </nav>
        <button className="a-btn a-btn-ghost a-logout" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.25)' }} onClick={logout}>
          Log out
        </button>
      </aside>
      <div className="a-main">
        <ConfirmProvider>
          <Outlet />
        </ConfirmProvider>
      </div>
    </div>
  );
}
