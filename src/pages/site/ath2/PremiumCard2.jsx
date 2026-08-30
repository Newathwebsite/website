import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectHref } from './ProjectFaces';
import MediaModal from './MediaModal';

const ICONS = ['⌂', '▱', '↗', '▥'];

// "Premium Wide" card theme — adapted from the client-supplied index(1).html
// reference design, bound to real project data instead of fixed sample copy.
export default function PremiumCard2({ project: p }) {
  const [video, setVideo] = useState(null);
  const specs = (p.stats || []).slice(0, 4);
  const m = p.media || {};
  const locParts = p.location.split(',').map((s) => s.trim());
  const communityLabel = p.category === 'villa' ? 'Villa Community' : 'Apartment Community';
  const tag = p.badge || (p.category === 'villa' ? 'Gated Community' : 'Apartment Community');
  const unitStat = specs[0];

  const actions = [];
  if (m.walkthrough) actions.push({ label: 'Walk Through', icon: '▶', onClick: () => setVideo(m.walkthrough) });
  if (m.aerial) actions.push({ label: 'Aerial View', icon: '360°', onClick: () => setVideo(m.aerial) });
  if (m.hometour) actions.push({ label: 'Home Tour', icon: '360°', href: m.hometour });
  if (m.routemap) actions.push({ label: 'Route Map', icon: '⌖', onClick: () => setVideo(m.routemap) });
  else if (m.gmap) actions.push({ label: 'Route Map', icon: '⌖', href: m.gmap });

  return (
    <article className="pc2-card">
      <section className="pc2-top">
        <div className="pc2-visual">
          {p.coverImage && <img src={p.coverImage} alt={p.name} />}
          <div className="pc2-loc-badge">
            <div className="pc2-pin">●</div>
            <div><b>{locParts[0]}</b><span>{locParts.slice(1).join(', ')}</span></div>
          </div>
          <div className="pc2-visual-bottom">
            <div>
              <div className="pc2-eyebrow">Premium {communityLabel}</div>
              <div className="pc2-visual-title">{p.name && <span>{p.name}</span>}</div>
            </div>
            {unitStat && <div className="pc2-status">{unitStat.v} {unitStat.l}</div>}
          </div>
        </div>

        <div className="pc2-info">
          <div>
            <div className="pc2-brand-row">
              <div className="pc2-brand">{p.name.toUpperCase()}<small>{locParts[locParts.length - 1]}</small></div>
              <div className="pc2-tag">{tag.toUpperCase()}</div>
            </div>

            {p.tagline && <h1><span>{p.tagline}</span></h1>}
            {p.description && <p className="pc2-description">{p.description}</p>}

            <div className="pc2-specs">
              {specs.map((s, i) => (
                <div className="pc2-spec" key={i}>
                  <div className="pc2-icon">{ICONS[i] || '•'}</div>
                  <div><label>{s.l}</label><strong>{s.v}</strong></div>
                </div>
              ))}
            </div>

            {actions.length > 0 && (
              <div className="pc2-actions" style={{ gridTemplateColumns: `repeat(${actions.length},1fr)` }}>
                {actions.map((a, i) => (
                  a.href ? (
                    <a key={i} className="pc2-action" href={a.href} target="_blank" rel="noopener noreferrer"><div className="pc2-aicon">{a.icon}</div><span>{a.label}</span></a>
                  ) : (
                    <button key={i} type="button" className="pc2-action" onClick={a.onClick}><div className="pc2-aicon">{a.icon}</div><span>{a.label}</span></button>
                  )
                ))}
              </div>
            )}

            <Link className="pc2-cta" to={projectHref(p)}>BEGIN YOUR JOURNEY &nbsp;→</Link>
          </div>
        </div>
      </section>

      <footer className="pc2-footer">
        <span>{p.configs?.toUpperCase() || communityLabel.toUpperCase()} · {tag.toUpperCase()}</span>
        <span>SITE VISITS AVAILABLE</span>
      </footer>
      <MediaModal url={video} onClose={() => setVideo(null)} />
    </article>
  );
}
