import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import StatsBand from './StatsBand';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function About2() {
  const ref = useRef(null);
  const { pages } = useData();
  const page = pages.find((p) => p.slug === 'about');
  useReveal(ref);
  usePageSeo(page, 'About Us');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">About Us</span>
          <h1>Homes built <span className="accent-text">on trust</span></h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head center rv">
            <div className="kicker">Our Story</div>
            <h2>ATH Precision, in every design</h2>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
          <p style={{ textAlign: 'center', marginTop: 30 }}>
            Independent villas like <Link to="/projects/ath-feathers" style={{ color: 'var(--primary)', fontWeight: 600 }}>ATH Feathers</Link> in Kundrathur, to apartment communities across Chennai's growth corridors.
          </p>
        </div>
      </section>

      <StatsBand />

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Want to know more about us?</h2>
            <p>Reach out — we're happy to walk you through our projects and process.</p>
            <Link className="btn btn-light" to="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
