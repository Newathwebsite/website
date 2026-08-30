import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { projectHref } from './ProjectFaces';

// The "Villas" and "Apartments" footer columns are always generated live
// from real project data (name + location, linking to that project's own
// page) instead of being hand-maintained link lists — so they can never
// drift out of date as projects are added, renamed or unpublished. Kept as
// two separate columns (not grouped under one "Projects" column) so each
// gets its own heading and scroll area.
function ProjectListColumn({ title, list }) {
  if (!list.length) return null;
  return (
    <div className="foot-col foot-col-projects">
      <h4>{title}</h4>
      {list.map((p) => (
        <Link key={p.id} to={projectHref(p)} className="foot-proj-link">
          {p.name} <span>— {p.location}</span>
        </Link>
      ))}
    </div>
  );
}

function FooterColumn({ col }) {
  return (
    <div className="foot-col" key={col.title}>
      <h4>{col.title}</h4>
      {col.links.map((l) => (
        <Link key={l.path} to={l.path} style={{ position: 'relative' }}>
          <span>{l.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function Footer2() {
  const { settings, projects } = useData();
  const footer = settings.footer || { tagline: '', columns: [] };
  const published = projects.filter((p) => p.published);
  const villaProjects = published.filter((p) => p.category === 'villa');
  const apartmentProjects = published.filter((p) => p.category === 'apartment');

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <img src={settings.logo} alt={settings.siteName} />
            {footer.tagline && <p>{footer.tagline}</p>}
          </div>
          {footer.columns.map((col) => (
            col.title === 'Projects' ? (
              <Fragment key="Projects">
                <ProjectListColumn title="Villas" list={villaProjects} />
                <ProjectListColumn title="Apartments" list={apartmentProjects} />
              </Fragment>
            ) : (
              <FooterColumn key={col.title} col={col} />
            )
          ))}
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} {settings.siteName} Pvt Ltd. All rights reserved.</span>
          <span><b>CREDAI Member</b> · 20+ Years of Expertise · 100+ Completed Projects · 1000+ Happy Customers</span>
        </div>
      </div>
    </footer>
  );
}
