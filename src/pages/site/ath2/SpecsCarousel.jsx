import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SPEC_CARDS = [
  { cat: 'STRUCTURE', h: 'Built With Confidence', items: ['RCC framed structure and red bricks for external and internal walls.', 'Earthquake-resistant design to Seismic Zone III.', 'Anti-termite treatment during construction.'] },
  { cat: 'TILING · FLOORING', h: 'Designed Underfoot', items: ['Kajaria, Somany or equivalent quality tiles.', 'Vitrified tiles for living, dining and utility areas.', 'Anti-skid ceramic tiles for toilets and balconies.', 'Granite-finished staircase.'] },
  { cat: 'ELECTRICAL', h: 'Ready For Living', items: ['Concealed wiring with Legrand/Havells switches.', 'Polycab/Lapp or equivalent cabling.', 'AC provisions and essential power backup.'] },
  { cat: 'PAINTING', h: 'Elegant Finishes', items: ['Internal walls with putty, primer and premium emulsion.', 'External walls with weather-resistant paint.', 'MS railings with enamel finish.'] },
  { cat: 'KITCHEN', h: 'Made For Everyday', items: ['18 mm black granite kitchen platform.', 'Quartz sink with drain board.', 'Vitrified tile flooring and quality CP fittings.'] },
  { cat: 'DOORS · WINDOWS · PLUMBING', h: 'Finished In Detail', items: ['Teak main door with designer hardware.', 'UPVC French doors, windows and ventilators.', 'Jaquar or equivalent sanitaryware and CP fittings.'] },
];

function cardTransform(delta, total) {
  if (delta === 0) return { x: 0, scale: 1, rot: 0, opacity: 1, z: 6 };
  if (delta === 1 || delta === -(total - 1)) return { x: 108, scale: 0.88, rot: 2, opacity: 0.36, z: 3 };
  if (delta === -1 || delta === total - 1) return { x: -108, scale: 0.88, rot: -2, opacity: 0.36, z: 3 };
  if (delta === 2 || delta === -(total - 2)) return { x: 160, scale: 0.78, rot: 4, opacity: 0.12, z: 1 };
  return { x: -160, scale: 0.78, rot: -4, opacity: 0.12, z: 1 };
}

export default function SpecsCarousel({ image }) {
  const [index, setIndex] = useState(0);
  const cardRefs = useRef([]);
  const total = SPEC_CARDS.length;
  const touchRef = useRef({ x: 0 });

  useGSAP(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      let delta = i - index;
      if (delta > total / 2) delta -= total;
      if (delta < -total / 2) delta += total;
      const abs = Math.abs(delta);
      const t = abs <= 2 ? cardTransform(delta, total) : { x: delta > 0 ? 160 : -160, scale: 0.78, rot: delta > 0 ? 4 : -4, opacity: 0, z: 0 };
      gsap.to(el, {
        xPercent: -50,
        x: t.x,
        scale: t.scale,
        rotate: t.rot,
        opacity: t.opacity,
        zIndex: t.z,
        duration: 0.55,
        ease: 'power3.out',
        pointerEvents: delta === 0 ? 'auto' : 'none',
      });
    });
  }, [index]);

  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  return (
    <div className="pd2-spec-scrolltrack">
      <div
        className="pd2-spec-deck"
        onTouchStart={(e) => { touchRef.current.x = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchRef.current.x;
          if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        }}
      >
        {SPEC_CARDS.map((c, i) => (
          <article className="pd2-spec-card" key={c.cat} ref={(el) => (cardRefs.current[i] = el)}>
            <div className="pd2-spec-card-image">
              {image ? <img src={image} alt={c.h} /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>
              )}
            </div>
            <div className="pd2-spec-card-content">
              <span>{c.cat}</span>
              <h3>{c.h}</h3>
              <ul>{c.items.map((li) => <li key={li}>{li}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
      <div className="pd2-spec-controls">
        <button type="button" className="pd2-spec-nav pd2-spec-prev" aria-label="Previous specification" onClick={() => go(-1)}>←</button>
        <div className="pd2-spec-progress"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
        <button type="button" className="pd2-spec-nav pd2-spec-next" aria-label="Next specification" onClick={() => go(1)}>→</button>
      </div>
    </div>
  );
}
