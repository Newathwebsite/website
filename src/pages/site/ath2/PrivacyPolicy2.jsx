import { useRef } from 'react';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import { usePageSeo } from './usePageSeo';
import PlaceholderNote from './PlaceholderNote';
import SectionCards from './SectionCards';
import { heroBackgroundStyle } from './HeroBackground';

export default function PrivacyPolicy2() {
  const ref = useRef(null);
  const { pages } = useData();
  const page = pages.find((p) => p.slug === 'privacy-policy');
  useReveal(ref);
  usePageSeo(page, 'Privacy Policy');
  const hasHeroPhoto = page?.heroBackground?.desktop || page?.heroBackground?.mobile;

  return (
    <div ref={ref}>
      <header className={`hero ${hasHeroPhoto ? 'hero-photo' : ''}`} style={heroBackgroundStyle(page?.heroBackground, { paddingBottom: 40 })}>
        <div className="wrap">
          <span className="eyebrow">Privacy Policy</span>
          <h1>Not a real policy <span className="accent-text">yet</span></h1>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <PlaceholderNote page={page} />
          <SectionCards sections={page?.sections} columns={1} />
        </div>
      </section>
    </div>
  );
}
