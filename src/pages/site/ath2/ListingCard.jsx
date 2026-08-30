import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { priceStat } from '../../../lib/mayaFaq';
import { projectHref } from './ProjectFaces';

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

export default function ListingCard({ project }) {
  const ref = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const ps = priceStat(project);

  const onMouseMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    gsap.to(el, {
      rotateX: ((y - cy) / cy) * -6,
      rotateY: ((x - cx) / cx) * 6,
      y: -6,
      transformPerspective: 1200,
      duration: 0.3,
      ease: 'power2.out',
    });
  };
  const onMouseLeave = () => {
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, y: 0, duration: 0.4, ease: 'power2.out' });
  };

  return (
    <div className="listing-card" ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onClick={() => setFlipped((f) => !f)}>
      <div className={`lc-flip ${flipped ? 'flipped' : ''}`}>
        <div className="lc-face lc-front">
          <div className="lc-media">
            <span className="badge-type">{project.category === 'villa' ? 'Villa' : 'Apartment'}</span>
            {project.coverImage ? (
              <img className="lc-cover" src={project.coverImage} alt={project.name} />
            ) : (
              <div className="lc-cover-placeholder">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M9 15h.01M15 11h.01M15 15h.01" /></svg>
                <span>Photos Coming Soon</span>
              </div>
            )}
            {project.logo && <img className="tf-logo" src={project.logo} alt={project.logoAlt || `${project.name} logo`} />}
            <div className="lc-pin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {project.location && <span>{project.location}</span>}
            </div>
          </div>
          <div className="lc-body">
            {project.logo ? (
              <img className="lc-logo" src={project.logo} alt={project.logoAlt || `${project.name} logo`} />
            ) : (
              <h3>{project.name && <span>{project.name}</span>}</h3>
            )}
            <div className="lc-stats">
              {(project.stats || []).slice(0, 3).map((s, i) => <div key={i}><b>{s.v}</b> {s.l}</div>)}
            </div>
            <div className="lc-hint">Tap to flip ⟲</div>
          </div>
        </div>
        <div className="lc-face lc-back">
          <div className="lc-body">
            {project.logo ? <img className="lc-logo-back" src={project.logo} alt={project.name} /> : <h3>{project.name}</h3>}
            {project.price ? (
              <div className="tf-price">{project.price.map((p, i) => <div key={i}><b>{p.v}</b><span>{p.l}</span></div>)}</div>
            ) : ps ? (
              <div className="tf-stats">{(project.stats || []).map((s, i) => <div key={i}><b>{s.v}</b><span>{s.l}</span></div>)}</div>
            ) : (
              <p className="tf-note">Details on request.</p>
            )}
            <MediaBadges project={project} />
            <Link className="btn btn-primary lc-more" to={projectHref(project)} onClick={(e) => e.stopPropagation()}>Learn More →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
