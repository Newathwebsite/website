import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function NewsEvents2() {
  const ref = useRef(null);
  const { pages, newsEvents } = useData();
  const page = pages.find((p) => p.slug === 'news-events');
  useReveal(ref);
  usePageSeo(page, 'News & Events');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          <span className="eyebrow">News &amp; Events</span>
          <h1>What's <span className="accent-text">happening</span></h1>
          {page?.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {newsEvents.length === 0 ? (
            <PlaceholderNote page={page} />
          ) : (
            <div className="grid-3 rv" style={{ marginBottom: 40 }}>
              {newsEvents.map((n) => (
                <div className="card" key={n.id} style={{ position: 'relative' }}>
                  {n.image && (
                    <img
                      src={n.image}
                      alt={n.imageAlt || n.title}
                      style={{ borderRadius: 12, marginBottom: 14 }}
                    />
                  )}
                  <div className="kicker">{n.date}</div>
                  {n.title && <h3 style={{ marginTop: 6 }}><span>{n.title}</span></h3>}
                  {(n.content || n.excerpt) && <p>{n.content || n.excerpt}</p>}
                </div>
              ))}
            </div>
          )}

          <SectionCards sections={page?.sections} columns={3} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Want to be notified of new launches?</h2>
            <p>Leave your details and we'll reach out when there's news to share.</p>
            <Link className="btn btn-light" to="/contact">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
