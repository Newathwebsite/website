import { useState } from 'react';
import TinderDeck from './TinderDeck';
import ProjFan from './ProjFan';
import FlipCard2 from './FlipCard2';
import PremiumCard2 from './PremiumCard2';
import useIsMobile from './useIsMobile';

// cardStyleDesktop/cardStyleMobile come from the Home Page editor's
// "Featured Projects" section. 'classic' keeps the original swipe/fan deck
// (its drag+flip interaction doesn't map onto the other two card designs);
// 'flip'/'premium' instead render a plain grid of that card style, matching
// how Villas/Apartments already support them.
export default function FeaturedProjects({ projects, cardStyleDesktop = 'classic', cardStyleMobile = 'classic' }) {
  const [type, setType] = useState('villa');
  const list = projects.filter((p) => p.category === type && p.published);
  const isMobile = useIsMobile();
  const style = isMobile ? cardStyleMobile : cardStyleDesktop;

  return (
    <>
      <div className="proj-tabs">
        <button type="button" className={`proj-tab ${type === 'villa' ? 'active' : ''}`} onClick={() => setType('villa')}>Villas</button>
        <button type="button" className={`proj-tab ${type === 'apartment' ? 'active' : ''}`} onClick={() => setType('apartment')}>Apartments</button>
      </div>
      {style === 'classic' ? (
        <>
          <TinderDeck key={`tinder-${type}`} projects={list} />
          <ProjFan key={`fan-${type}`} projects={list} />
        </>
      ) : (
        <div className={`listing-grid ${style === 'premium' ? 'listing-grid-wide' : ''}`}>
          {list.map((p) => (style === 'premium' ? <PremiumCard2 key={p.id} project={p} /> : <FlipCard2 key={p.id} project={p} />))}
        </div>
      )}
    </>
  );
}
