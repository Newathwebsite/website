import { useRef } from 'react';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import ProjectCard from './ProjectCard';
import useIsMobile from './useIsMobile';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function Apartments2() {
  const ref = useRef(null);
  const { projects, settings, pages } = useData();
  const page = pages.find((p) => p.slug === 'apartments');
  const list = projects.filter((p) => p.category === 'apartment' && p.published);
  const isMobile = useIsMobile();
  const pageStyle = settings.cardStyle?.apartments || {};
  const isPremium = (isMobile ? pageStyle.mobile : pageStyle.desktop) === 'premium';
  const device = isMobile ? 'mobile' : 'desktop';
  const columns = settings.cardGrid?.apartments?.[device] || 3;
  const animation = settings.cardAnimation?.apartments?.[device] || 'none';
  const heroBackground = (page?.heroBackground?.desktop || page?.heroBackground?.mobile)
    ? page.heroBackground
    : { desktop: '/assets/project-merlion-apartments.jpg' };
  useReveal(ref);

  return (
    <div ref={ref}>
      <header className="hero hero-photo" style={heroBackgroundStyle(heroBackground)}>
        <div className="wrap">
          <span className="eyebrow">Apartments</span>
          <h1>Apartment communities, <span className="accent-text">smartly designed</span></h1>
          <p className="lede">Well-planned apartment living from a CREDAI member developer — precision design, prime locations, and everyday amenities.</p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <PlaceholderNote page={page} />

          <div className="sec-head center rv">
            <div className="kicker">Ongoing Apartments</div>
            <h2>Current apartment communities</h2>
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
                <ProjectCard project={p} page="apartments" />
              </div>
            ))}
          </div>

          <div className="sec-head center rv" style={{ marginTop: 60 }}>
            <div className="kicker">What to Expect</div>
            <h2>Designed for modern apartment living</h2>
          </div>
          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>
    </div>
  );
}
