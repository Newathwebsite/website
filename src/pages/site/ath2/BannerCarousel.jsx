import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useData } from '../../../context/DataContext';
import { projectHref } from './ProjectFaces';

function TypeIcon({ category }) {
  return category === 'villa' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  );
}

// Discrete, timed auto-advance (not a fixed-duration CSS marquee) — every
// card holds for exactly settings.banner.autoScrollSeconds, sized from the
// admin-configured width/height, and doubled for a seamless infinite loop.
export default function BannerCarousel({ projects }) {
  const { settings } = useData();
  const navigate = useNavigate();
  const { width = 320, height = 90, autoScrollSeconds = 5 } = settings.banner || {};
  const list = projects.filter((p) => p.published);
  const doubled = [...list, ...list];
  const gap = 18;
  const step = width + gap;

  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const activeTokenRef = useRef(null);

  // Self-rescheduling setTimeout chain, guarded by a per-invocation token,
  // instead of setInterval — StrictMode's mount→cleanup→mount dev check does
  // not reliably cancel a plain setInterval here, which silently doubled the
  // advance rate. A stale chain's token check fails on its very next tick and
  // it quietly stops, so at most one chain is ever actually advancing state.
  useEffect(() => {
    if (!list.length) return;
    const token = {};
    activeTokenRef.current = token;
    const delay = Math.max(1, autoScrollSeconds) * 1000;

    function tick() {
      if (activeTokenRef.current !== token) return;
      if (!pausedRef.current) setIndex((i) => i + 1);
      timeoutId = setTimeout(tick, delay);
    }
    let timeoutId = setTimeout(tick, delay);

    return () => {
      clearTimeout(timeoutId);
      if (activeTokenRef.current === token) activeTokenRef.current = null;
    };
  }, [autoScrollSeconds, list.length]);

  useEffect(() => {
    if (!trackRef.current) return;
    gsap.to(trackRef.current, { x: -index * step, duration: 0.7, ease: 'power2.inOut' });
    if (index >= list.length) {
      const resetTimer = setTimeout(() => {
        gsap.set(trackRef.current, { x: 0 });
        setIndex(0);
      }, 750);
      return () => clearTimeout(resetTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!list.length) return null;

  const onCardClick = (p, e) => {
    e.preventDefault();
    navigate(p.bannerLink || projectHref(p));
  };

  return (
    <div
      className="banner-carousel"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="banner-track" ref={trackRef} style={{ animation: 'none' }}>
        {doubled.map((p, i) => (
          <a
            className="banner-card"
            href={p.bannerLink || projectHref(p)}
            key={`${p.id}-${i}`}
            style={{ width, aspectRatio: 'auto', height }}
            onClick={(e) => onCardClick(p, e)}
          >
            <div className="bc-media">
              {p.coverImage ? <img src={p.coverImage} alt={p.coverImageAlt || p.name} /> : <TypeIcon category={p.category} />}
              {p.logo && <img className="bc-logo" src={p.logo} alt={p.logoAlt || `${p.name} logo`} />}
            </div>
            <div className="bc-body"><b>{p.name}</b><span>{p.location}</span></div>
          </a>
        ))}
      </div>
    </div>
  );
}
