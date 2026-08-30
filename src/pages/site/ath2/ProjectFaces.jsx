import { Link } from 'react-router-dom';
import { priceStat } from '../../../lib/mayaFaq';

function TypeIcon({ category }) {
  return category === 'villa' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  );
}

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}

function projectHref(p) {
  return p.slug === 'ath-feathers' ? '/projects/ath-feathers' : `/projects/${p.slug}`;
}

function MediaBadges({ project }) {
  const m = project.media || {};
  if (!m.walkthrough && !m.aerial && !m.routemap) return null;
  return (
    <div className="tf-media-badges">
      {m.walkthrough && <span>▶ Walkthrough</span>}
      {m.aerial && <span>🚁 Aerial View</span>}
      {m.routemap && <span>⌖ Route Map</span>}
    </div>
  );
}

export function TinderFaces({ project }) {
  const ps = priceStat(project);
  return (
    <>
      <div className="tinder-face front">
        <div className="tf-media">
          {project.coverImage ? <img src={project.coverImage} alt={project.name} /> : <TypeIcon category={project.category} />}
          {project.badge && <span className="tf-badge">{project.badge}</span>}
          {project.logo && <img className="tf-logo" src={project.logo} alt={project.logoAlt || `${project.name} logo`} />}
        </div>
        <div className="tf-body"><h3>{project.name}</h3><div className="tf-loc"><PinIcon />{project.location}</div></div>
        <div className="tf-hint">Tap to flip ⟲</div>
      </div>
      <div className="tinder-face back">
        <div className="tf-body">
          <h3>{project.name}</h3>
          {project.price ? (
            <div className="tf-price">{project.price.map((p, i) => <div key={i}><b>{p.v}</b><span>{p.l}</span></div>)}</div>
          ) : ps ? (
            <div className="tf-stats">{project.stats.map((s, i) => <div key={i}><b>{s.v}</b><span>{s.l}</span></div>)}</div>
          ) : (
            <p className="tf-note">Details on request.</p>
          )}
          <MediaBadges project={project} />
          <Link className="btn btn-primary tf-more" to={projectHref(project)} onClick={(e) => e.stopPropagation()}>Learn More →</Link>
        </div>
      </div>
    </>
  );
}

export function FanFace({ project }) {
  return (
    <>
      <div className="tf-media">
        {project.coverImage ? <img src={project.coverImage} alt={project.name} /> : <TypeIcon category={project.category} />}
        {project.logo && <img className="tf-logo" src={project.logo} alt={project.logoAlt || `${project.name} logo`} />}
      </div>
      <div className="tf-body"><h3>{project.name}</h3><div className="tf-loc"><PinIcon />{project.location}</div></div>
    </>
  );
}

export { projectHref };
