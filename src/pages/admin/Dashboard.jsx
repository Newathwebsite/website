import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export default function Dashboard() {
  const { projects, pages, testimonials, newsEvents, jobOpenings, blogPosts, media, users, forms } = useData();

  const stats = [
    { label: 'Projects', n: projects.length, to: '/admin/projects' },
    { label: 'Published Projects', n: projects.filter((p) => p.published).length, to: '/admin/projects' },
    { label: 'Content Pages', n: pages.length, to: '/admin/pages' },
    { label: 'Blog Posts', n: blogPosts.length, to: '/admin/blog' },
    { label: 'Testimonials', n: testimonials.length, to: '/admin/testimonials' },
    { label: 'News & Events', n: newsEvents.length, to: '/admin/news-events' },
    { label: 'Job Openings', n: jobOpenings.length, to: '/admin/careers' },
    { label: 'Media Uploads', n: media.length, to: '/admin/media' },
    { label: 'Enquiry Forms', n: forms.length, to: '/admin/forms' },
    { label: 'Users', n: users.length, to: '/admin/users' },
  ];

  return (
    <>
      <div className="a-topbar"><h1>Dashboard</h1></div>
      <div className="a-stats">
        {stats.map((s) => (
          <Link className="a-stat" key={s.label} to={s.to} style={{ display: 'block' }}>
            <div className="n">{s.n}</div>
            <div className="l">{s.label}</div>
          </Link>
        ))}
      </div>
      <div className="a-card">
        <h3 style={{ marginBottom: 10 }}>How this CMS works</h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--a-muted)', lineHeight: 1.6 }}>
          All content is managed here in the admin panel and saved through the site's API to the
          database, then served to visitors on the public site. Contact/enquiry forms on the public
          site are sent directly to your CRM's API, configured under <Link to="/admin/settings">Settings</Link>.
        </p>
      </div>
    </>
  );
}
