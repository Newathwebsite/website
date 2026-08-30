import { Fragment, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import BannerCarousel from './BannerCarousel';
import StatsBand from './StatsBand';
import FeaturedProjects from './FeaturedProjects';
import SectionCards from './SectionCards';

function BannerSection({ s, projects }) {
  return (
    <section className="sec" style={{ paddingBottom: 40 }}>
      <div className="wrap">
        <div className="sec-head center rv">
          {s.kicker && <div className="kicker"><span>{s.kicker}</span></div>}
          {s.heading && <h2><span>{s.heading}</span></h2>}
        </div>
      </div>
      <div className="rv"><BannerCarousel projects={projects} /></div>
    </section>
  );
}

function FeaturedSection({ s, projects }) {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head center rv">
          {s.kicker && <div className="kicker"><span>{s.kicker}</span></div>}
          {s.heading && <h2><span>{s.heading}</span></h2>}
          {s.body && <p><span>{s.body}</span></p>}
        </div>
        <div className="rv"><FeaturedProjects projects={projects} cardStyleDesktop={s.cardStyleDesktop} cardStyleMobile={s.cardStyleMobile} /></div>
      </div>
    </section>
  );
}

function PrecisionSection({ s }) {
  return (
    <section className="sec sec-soft">
      <div className="wrap">
        <div className="sec-head center rv">
          {s.kicker && <div className="kicker"><span>{s.kicker}</span></div>}
          {s.heading && <h2><span>{s.heading}</span></h2>}
          {s.body && <p><span>{s.body}</span></p>}
        </div>
        <div className="numbered-grid rv">
          {(s.items || []).map((p, i) => (
            <div className="numbered-card" key={i}>
              <div className="n">{String(i + 1).padStart(2, '0')}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ s }) {
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="cta-band rv">
        <div className="wrap" style={{ padding: '0 24px' }}>
          {s.heading && <h2><span>{s.heading}</span></h2>}
          {s.body && <p><span>{s.body}</span></p>}
          {s.ctaLabel && (
            <Link className="btn btn-light" to={s.ctaUrl || '/contact'}>
              <span>{s.ctaLabel}</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function CodeSection({ s }) {
  return <section className="sec-html" dangerouslySetInnerHTML={{ __html: s.html || '' }} />;
}

function GenericSection({ s }) {
  return (
    <section className="sec">
      <div className="wrap">
        <SectionCards sections={[s]} columns={3} />
      </div>
    </section>
  );
}

export default function Home2() {
  const ref = useRef(null);
  const { projects, settings } = useData();
  const home = settings.homePage;
  const hero = home.hero;
  const sections = home.sections || [];
  useReveal(ref);

  const renderSectionBody = (s) => {
    if (s.type === 'banner') return <BannerSection s={s} projects={projects} />;
    if (s.type === 'stats') return <StatsBand items={s.items} />;
    if (s.type === 'featured') return <FeaturedSection s={s} projects={projects} />;
    if (s.type === 'precision') return <PrecisionSection s={s} />;
    if (s.type === 'cta') return <CtaSection s={s} />;
    if (s.type === 'code') return <CodeSection s={s} />;
    return <GenericSection s={s} />;
  };

  return (
    <div ref={ref}>
      <header className="hero hero-split">
        <div className="wrap">
          <div className="hero-split-text">
            {hero.eyebrow && <span className="eyebrow"><span>{hero.eyebrow}</span></span>}
            <h1>
              {hero.headingLine1 && <span>{hero.headingLine1}</span>}<br />
              <span className="accent-text">{hero.headingAccent && <span>{hero.headingAccent}</span>}</span>{' '}
              <span className="script">{hero.headingScript && <span>{hero.headingScript}</span>}</span>
            </h1>
            <p className="lede">{hero.subheading && <span>{hero.subheading}</span>}</p>
            {hero.tag && <div className="tag"><span>{hero.tag}</span></div>}
            <div className="actions">
              {hero.primaryCtaLabel && (
                <Link className="btn btn-primary" to={hero.primaryCtaUrl || '/contact'}>
                  <span>{hero.primaryCtaLabel}</span>
                </Link>
              )}
              {hero.secondaryCtaLabel && (
                <Link className="btn btn-ghost" to={hero.secondaryCtaUrl || '/villas'} style={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff' }}>
                  <span>{hero.secondaryCtaLabel}</span>
                </Link>
              )}
            </div>
          </div>
          <div className="hero-split-media">
            <div className="hsm-glow" aria-hidden="true" />
            <div className="hsm-floor" aria-hidden="true" />
            <div className="hsm-cutout">
              {hero.image && <img src={hero.image} alt={hero.imageAlt || ''} />}
            </div>
          </div>
        </div>
      </header>

      {home.marqueePhrases?.length > 0 && (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...home.marqueePhrases, ...home.marqueePhrases].map((t, i) => <span key={i}>{t}</span>)}
          </div>
        </div>
      )}

      {sections.map((s) => {
        if (s.enabled === false) return null;
        return <Fragment key={s.id}>{renderSectionBody(s)}</Fragment>;
      })}
    </div>
  );
}
