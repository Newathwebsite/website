import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import TestimonialGrid from './TestimonialGrid';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function Testimonials2() {
  const ref = useRef(null);
  const { pages, testimonials } = useData();
  const page = pages.find((p) => p.slug === 'testimonials');
  useReveal(ref);
  usePageSeo(page, 'Testimonials');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">Testimonials</span>
          <h1>Communities that <span className="accent-text">speak for themselves</span></h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <PlaceholderNote page={page} />

          <div className="rv"><TestimonialGrid testimonials={testimonials} /></div>

          <div className="sec-head center rv">
            <div className="kicker">Why Families Trust Us</div>
            <h2>Built on a track record, not a pitch</h2>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Want to hear it from a homeowner?</h2>
            <p>Ask our team to connect you with a resident during your site visit.</p>
            <Link className="btn btn-light" to="/contact">Book a Site Visit</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
