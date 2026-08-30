import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Replaces the original site's `.rv` + IntersectionObserver fade-up with a
// GSAP ScrollTrigger.batch reveal, scoped to the given container ref.
//
// Trigger positions are computed at mount time, but images (hero photos,
// project cards, the hero-cutout PNG) finish loading afterwards and shift
// the layout — without a refresh, ScrollTrigger's cached positions go stale
// and some sections never reveal. Refresh once things settle.
export function useReveal(ref) {
  useGSAP(() => {
    const els = ref.current?.querySelectorAll('.rv');
    if (!els?.length) return;
    gsap.set(els, { opacity: 0, y: 24 });
    ScrollTrigger.batch(els, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }),
    });

    const images = ref.current.querySelectorAll('img');
    const onImgDone = () => ScrollTrigger.refresh();
    images.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', onImgDone, { once: true });
      img.addEventListener('error', onImgDone, { once: true });
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(t);
  }, { scope: ref });
}
