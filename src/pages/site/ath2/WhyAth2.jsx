import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import StatsBand from './StatsBand';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

const PRECISION = [
  { n: '01', title: 'Prime Locations', body: 'Every site is chosen for connectivity — proximity to growth corridors, highways and everyday infrastructure.' },
  { n: '02', title: 'Smart Design', body: 'Ventilation, natural light and thoughtful layouts — homes planned around how modern families actually live.' },
  { n: '03', title: 'Sustainability', body: 'An eco-conscious approach to every project, built to minimise environmental impact without compromising comfort.' },
  { n: '04', title: 'Transparency', body: 'Clear communication from blueprint to handover, so you always know exactly where your home stands.' },
  { n: '05', title: 'Unwavering Quality', body: 'Construction standards built for the long term — strength, safety and craftsmanship that lasts.' },
  { n: '06', title: 'On-Time Delivery', body: 'We plan around your timeline and deliver on the schedule we promise, project after project.' },
];

export default function WhyAth2() {
  const ref = useRef(null);
  const { pages } = useData();
  const page = pages.find((p) => p.slug === 'why-ath');
  useReveal(ref);
  usePageSeo(page, 'Why ATH?');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">Why ATH?</span>
          <h1>Dreams. <span className="accent-text">Communities.</span> Trust.</h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>

      <StatsBand />

      <section className="sec sec-soft">
        <div className="wrap">
          <div className="sec-head center rv">
            <div className="kicker">ATH Precision</div>
            <h2>Precision in every design</h2>
            <p>Six things every Asset Tree Homes project is built around.</p>
          </div>
          <div className="numbered-grid rv">
            {PRECISION.map((p) => (
              <div className="numbered-card" key={p.n}>
                <div className="n">{p.n}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Want to see it for yourself?</h2>
            <p>Explore our ongoing villas and apartments, or book a private site visit.</p>
            <Link className="btn btn-light" to="/villas">Explore <u>Projects</u></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
