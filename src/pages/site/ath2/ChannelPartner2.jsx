import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function ChannelPartner2() {
  const ref = useRef(null);
  const { pages } = useData();
  const page = pages.find((p) => p.slug === 'channel-partner');
  useReveal(ref);
  usePageSeo(page, 'Channel Partner');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">Channel Partner</span>
          <h1>Grow with a <span className="accent-text">trusted developer</span></h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <PlaceholderNote page={page} />

          <div className="sec-head center rv">
            <div className="kicker">Already a Partner?</div>
            <h2>Sign in to your portal</h2>
            <p><a href={page?.portalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>iris.assettreehomes.com →</a></p>
          </div>

          <div className="sec-head center rv" style={{ marginTop: 60 }}>
            <div className="kicker">Why Partner With Us</div>
            <h2>Sell with confidence</h2>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Interested in becoming a channel partner?</h2>
            <p>Register your interest and our partnerships team will reach out.</p>
            <Link className="btn btn-light" to="/contact">Register Interest</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
