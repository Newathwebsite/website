import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import ProjectCard from './ProjectCard';
import useIsMobile from './useIsMobile';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function Villas2() {
  const ref = useRef(null);
  const { projects, settings, pages } = useData();
  const page = pages.find((p) => p.slug === 'villas');
  const isMobile = useIsMobile();
  const pageStyle = settings.cardStyle?.villas || {};
  const isPremium = (isMobile ? pageStyle.mobile : pageStyle.desktop) === 'premium';
  const device = isMobile ? 'mobile' : 'desktop';
  const columns = settings.cardGrid?.villas?.[device] || 3;
  const animation = settings.cardAnimation?.villas?.[device] || 'none';
  const feathers = projects.find((p) => p.slug === 'ath-feathers');
  const list = projects.filter((p) => p.category === 'villa' && p.published && p.slug !== 'ath-feathers');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;
  useReveal(ref);

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">Villas</span>
          <h1>Independent villas, <span className="accent-text">your rules</span></h1>
          <p className="lede">Freehold land, freehold home. Asset Tree Homes' villa communities are designed for families who want their own sky and their own rules.</p>
        </div>
      </header>

      {feathers && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="project-card rv">
              <div className="pc-media">
                <span className="pc-badge">{feathers.badge}</span>
                {feathers.coverImage && <img src={feathers.coverImage} alt="ATH Feathers — gated community entrance arch, Kundrathur" />}
              </div>
              <div className="pc-body">
                <div className="kicker">ATH Feathers · {feathers.location}</div>
                {feathers.tagline && <h3><span>{feathers.tagline}</span></h3>}
                {feathers.description && <p>{feathers.description}</p>}
                <div className="pc-price">
                  {(feathers.price || []).map((p, i) => <div key={i}><b>{p.v}</b><span>{p.l}</span></div>)}
                </div>
                <Link className="btn btn-primary" to="/projects/ath-feathers">View Full Project Details →</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head center rv">
            <div className="kicker">More Villa Communities</div>
            <h2>Every ATH villa address</h2>
          </div>
          <div
            className={`listing-grid rv ${isPremium ? 'listing-grid-wide' : ''}`}
            style={!isPremium ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
          >
            {list.map((p, i) => (
              <div
                key={p.id}
                className={animation !== 'none' ? `card-anim-${animation}` : ''}
                style={{ position: 'relative', height: '100%', animationDelay: animation !== 'none' ? `${i * 0.08}s` : undefined }}
              >
                <ProjectCard project={p} page="villas" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-soft">
        <div className="wrap">
          <div className="sec-head center rv">
            <div className="kicker">Why a Villa</div>
            <h2>Your land, your home, your rules</h2>
          </div>
          <SectionCards sections={page?.sections} columns={4} />
        </div>
      </section>
    </div>
  );
}
