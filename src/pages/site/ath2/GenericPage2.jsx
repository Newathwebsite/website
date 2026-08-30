import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';
import NotFound from '../NotFound';

// Renders any page created via Admin -> Pages -> "+ Add Page" that isn't one
// of the site's fixed, hand-built templates (About, Villas, Contact, etc.)
// — a simple hero + section-cards + contact CTA, so a brand new page
// created in the CMS actually has somewhere to live instead of matching
// the catch-all 404.
export default function GenericPage2() {
  const ref = useRef(null);
  const { slug } = useParams();
  const { pages } = useData();
  const page = pages.find((p) => p.slug === slug);
  useReveal(ref);
  usePageSeo(page, page?.title);

  if (!page) return <NotFound />;

  const hasHeroPhoto = page.heroBackground?.desktop || page.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page.heroBackground, { paddingBottom: 60 })}>
        <div className="wrap">
          {page.title && <h1><span>{page.title}</span></h1>}
          {page.subtitle && <p className="lede">{page.subtitle}</p>}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <PlaceholderNote page={page} />
          <SectionCards sections={page.sections} columns={3} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="cta-band rv">
          <div className="wrap" style={{ padding: '0 24px' }}>
            <h2>Want to know more?</h2>
            <p>Reach out — we're happy to help.</p>
            <Link className="btn btn-light" to="/contact">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
