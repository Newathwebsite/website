import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function Nri2() {
  const ref = useRef(null);
  const { pages } = useData();
  const page = pages.find((p) => p.slug === 'nri');
  useReveal(ref);
  usePageSeo(page, 'NRI Corner');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">NRI Corner</span>
          <h1>Invest in Chennai, <span className="accent-text">from anywhere</span></h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <PlaceholderNote page={page} />
          <div className="sec-head center rv">
            <div className="kicker">Why NRIs Choose Us</div>
            <h2>A trusted developer, wherever you are</h2>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Planning to invest from abroad?</h2>
            <p>Share your details and we'll set up a call at a time that works across time zones.</p>
            <Link className="btn btn-light" to="/contact">Talk to Our Team</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
