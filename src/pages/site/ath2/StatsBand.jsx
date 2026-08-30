import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_STATS = [
  { value: '20+', label: 'Years of Expertise' },
  { value: '100+', label: 'Completed Projects' },
  { value: '1000+', label: 'Happy Customers' },
  { value: 'CREDAI', label: 'Member Developer' },
];

// Accepts admin-edited {value, label} pairs (see Admin -> Home Page); falls
// back to the original fixed stats for other pages that render this band
// (e.g. About) without passing their own. A stat only count-up-animates
// when its value starts with digits — "CREDAI" (or any other plain text
// value) just renders as-is, matching the real site's own behavior.
export default function StatsBand({ items }) {
  const ref = useRef(null);
  const stats = items?.length ? items : DEFAULT_STATS;

  useGSAP(() => {
    const nodes = ref.current.querySelectorAll('b[data-target]');
    nodes.forEach((el) => {
      const target = Number(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const counter = { n: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            n: target,
            duration: 1.1,
            ease: 'power3.out',
            onUpdate: () => { el.textContent = Math.round(counter.n).toLocaleString('en-IN') + suffix; },
          });
        },
      });
    });

    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(t);
  }, { scope: ref, dependencies: [stats] });

  return (
    <section className="stats" ref={ref}>
      <div className="wrap grid">
        {stats.map((s, i) => {
          const m = String(s.value).match(/^([\d,]+)(.*)$/);
          return (
            <div key={i}>
              {m ? <b data-target={m[1].replace(/,/g, '')} data-suffix={m[2]}>0{m[2]}</b> : <b>{s.value}</b>}
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
