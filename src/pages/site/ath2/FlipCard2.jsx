import { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectHref } from './ProjectFaces';
import MediaModal from './MediaModal';

const STATUS = {
  upcoming: { label: 'Pre-Launch', cls: 'pre', tag: 'EARLY ACCESS' },
  ongoing: { label: 'Ongoing', cls: 'ongoing', tag: 'CONSTRUCTION' },
  completed: { label: 'Completed', cls: 'done', tag: 'READY COMMUNITY' },
};

// "Rich Flip Cards" theme — adapted from the client-supplied
// property-flip-cards.html reference design, bound to real project data
// instead of the reference's fixed sample content.
export default function FlipCard2({ project: p }) {
  const [flipped, setFlipped] = useState(false);
  const [video, setVideo] = useState(null);
  const status = STATUS[p.status] || STATUS.ongoing;
  const specs = (p.stats || []).slice(0, 4);
  const m = p.media || {};

  const flip = (e) => { e.stopPropagation(); setFlipped((f) => !f); };

  return (
    <article className={`fc2-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
      <div className="fc2-inner">
        <section className="fc2-face fc2-front">
          <div className="fc2-photo">
            {p.coverImage ? <img src={p.coverImage} alt={p.name} /> : null}
            <div className={`fc2-status ${status.cls}`}>{status.label}</div>
            <div className="fc2-location">{p.location && <span>{p.location}</span>}</div>
          </div>
          <div className="fc2-content">
            {p.logo ? <img className="fc2-logo" src={p.logo} alt={p.logoAlt || `${p.name} logo`} /> : <div className="fc2-project-name-sm">{p.name}</div>}
            <div className="fc2-project-row">
              <div className="fc2-project">{p.name && <span>{p.name}</span>}</div>
              <div className="fc2-type">{status.tag}</div>
            </div>
            {p.description && <p className="fc2-desc">{p.description}</p>}
            <div className="fc2-specs">
              {specs.map((s, i) => <div className="fc2-spec" key={i}><label>{s.l}</label><b>{s.v}</b></div>)}
            </div>
            <div className="fc2-actions">
              <Link className="fc2-primary" to="/contact" onClick={(e) => e.stopPropagation()}>ENQUIRE NOW ↓</Link>
              <div className="fc2-secondary-row">
                <Link className="fc2-secondary" to="/contact" onClick={(e) => e.stopPropagation()}>BOOK SITE VISIT</Link>
                <button type="button" className="fc2-secondary" onClick={flip}>VIEW MORE →</button>
              </div>
              <div className="fc2-hint">Tap to flip</div>
            </div>
          </div>
        </section>

        <section className="fc2-face fc2-back">
          <div className="fc2-back-top">
            {p.logo && <img className="fc2-back-logo" src={p.logo} alt={p.logoAlt || `${p.name} logo`} />}
            <button type="button" className="fc2-close" onClick={flip}>×</button>
          </div>
          <h2>Discover {p.name}</h2>
          <p className="fc2-back-intro">{p.description}</p>
          {m.walkthrough && (
            <div className="fc2-video" onClick={(e) => { e.stopPropagation(); setVideo(m.walkthrough); }}>
              {p.coverImage && <img src={p.coverImage} alt="Project video" />}
              <button type="button" className="fc2-play">▶</button>
              <div className="fc2-video-label">Project Walk Through</div>
            </div>
          )}
          <div className="fc2-links">
            <Link className="fc2-link" to={projectHref(p)} onClick={(e) => e.stopPropagation()}><span>Project Details</span><span>→</span></Link>
            {m.aerial && <div className="fc2-link" onClick={(e) => { e.stopPropagation(); setVideo(m.aerial); }}><span>Aerial View</span><span>→</span></div>}
            {m.hometour && <a className="fc2-link" href={m.hometour} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><span>360° Home Tour</span><span>→</span></a>}
            {(m.routemap || m.gmap) && (
              m.routemap ? (
                <div className="fc2-link" onClick={(e) => { e.stopPropagation(); setVideo(m.routemap); }}><span>Location &amp; Route Map</span><span>→</span></div>
              ) : (
                <a className="fc2-link" href={m.gmap} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><span>Location &amp; Route Map</span><span>→</span></a>
              )
            )}
          </div>
          <div className="fc2-back-bottom">
            <Link className="fc2-back-cta" to="/contact" onClick={(e) => e.stopPropagation()}>BOOK YOUR SITE VISIT &nbsp;→</Link>
            <div className="fc2-back-note">{p.badge || 'Schedule a personal project visit'}</div>
          </div>
        </section>
      </div>
      <MediaModal url={video} onClose={() => setVideo(null)} />
    </article>
  );
}
