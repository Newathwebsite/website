import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useReveal } from './useReveal';
import SpecsCarousel from './SpecsCarousel';
import TestimonialGrid from './TestimonialGrid';
import ContactForm2 from './ContactForm2';
import DynamicForm from './DynamicForm';
import { applySeo, resetSeo } from '../../../lib/seo';
import '../../../styles/pd2.css';

function statByLabel(stats, re) { return stats?.find((s) => re.test(s.l)); }
function maxMinutes(t) { const n = (String(t).match(/\d+/g) || []).map(Number); return n.length ? Math.max(...n) : 0; }
function bucketFor(mins) { const th = [5, 10, 15, 20, 30, 45, 60]; return th.find((t) => mins <= t) ?? th[th.length - 1]; }

function TypeIcon({ category, size = 76 }) {
  return category === 'villa' ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" /></svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  );
}

function VideoModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="pd-modal open">
      <div className="pd-modal-backdrop" onClick={onClose} />
      <div className={`pd-modal-box ${item.type === 'plans' ? 'is-image' : ''}`}>
        <button type="button" className="pd-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        <div className="pd-modal-body">
          {item.type === 'video' ? (
            <iframe src={item.url} allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture" allowFullScreen title="Project media" />
          ) : (
            <div className="pd-modal-floorplans">
              {item.urls.map((u) => <img key={u} src={u} alt="Floor plan" loading="lazy" />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail2() {
  const { slug } = useParams();
  const ref = useRef(null);
  const { projects, testimonials } = useData();
  const project = projects.find((p) => p.slug === slug && p.published);
  const [timeBucket, setTimeBucket] = useState(null);
  const [bhk, setBhk] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [modalItem, setModalItem] = useState(null);
  useReveal(ref);

  useEffect(() => {
    if (!project) { document.title = 'Project Not Found | Asset Tree Homes'; return; }
    applySeo({
      title: project.metaTitle || `${project.name} | Asset Tree Homes`,
      description: project.metaDescription || project.description,
    });
    return resetSeo;
  }, [project]);

  if (!project) {
    return (
      <div className="pd2" ref={ref}>
        <section className="pd2-section" style={{ paddingTop: 130 }}>
          <div className="pd2-container">
            <div className="pd-404">
              <svg className="pd-404-art" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="106" cy="90" r="82" stroke="#ece9f4" strokeWidth="3" strokeDasharray="7 9" />
                <path d="M58 112V72l48-35 48 35v40" stroke="#27306f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M78 112V90h28v22" stroke="#27306f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="44" y="110" width="124" height="6" rx="3" fill="#ece9f4" />
                <circle cx="146" cy="116" r="19" stroke="#f6ab1b" strokeWidth="6" />
                <line x1="159" y1="129" x2="176" y2="146" stroke="#f6ab1b" strokeWidth="7" strokeLinecap="round" />
              </svg>
              <h1 className="pd-404-title">Project Not Found</h1>
              <p className="pd-404-sub">We couldn't find that project — it may have been renamed or the link is out of date.</p>
              <div className="actions">
                <Link className="btn btn-primary" to="/villas">Browse Villas</Link>
                <Link className="btn btn-ghost" to="/apartments">Browse Apartments</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const p = project;
  const unitWord = p.category === 'villa' ? 'villa' : 'apartment';
  const unitStat = statByLabel(p.stats, /villas|units|blocks/i);
  const bhkStat = statByLabel(p.stats, /bhk/i);
  const sqftStat = statByLabel(p.stats, /sq\.?\s*ft/i);
  const floorStat = statByLabel(p.stats, /floors/i);
  const priceStat = statByLabel(p.stats, /price/i);
  const statTiles = [unitStat, bhkStat, sqftStat, floorStat].filter(Boolean);

  const mediaButtons = [];
  const m = p.media || {};
  if (m.walkthrough) mediaButtons.push({ label: '▶ Video Walkthrough', type: 'video', url: m.walkthrough });
  if (m.aerial) mediaButtons.push({ label: '🚁 Aerial View', type: 'video', url: m.aerial });
  if (m.hometour) mediaButtons.push({ label: '◉ Home Tour', type: 'video', url: m.hometour });
  if (m.routemap) mediaButtons.push({ label: '⌖ Route Map', type: 'video', url: m.routemap });
  if (m.floorplans?.length) mediaButtons.push({ label: '▦ Floor Plan', type: 'plans', urls: m.floorplans });

  const nearbyBuckets = {};
  (p.nearby || []).forEach((item) => {
    const b = bucketFor(maxMinutes(item.t));
    (nearbyBuckets[b] = nearbyBuckets[b] || []).push(item);
  });
  const bucketKeys = Object.keys(nearbyBuckets).map(Number).sort((a, b) => a - b);
  const activeBucket = timeBucket ?? bucketKeys[0];

  const bhkNums = bhkStat ? [...new Set((bhkStat.v.match(/\d/g) || []))] : [];
  const activeBhk = bhk ?? bhkNums[0];
  const planImg = m.floorplans?.[0] || p.coverImage || null;
  const planText = (n) => {
    const bits = [];
    if (sqftStat) bits.push(`${sqftStat.v} sq. ft. range`);
    if (floorStat) bits.push(`${floorStat.v} structure`);
    return `Part of ${p.name}'s ${bits.join(', ') || 'real project specs'}. Request the detailed floor plan for exact ${n} BHK dimensions.`;
  };

  const amenityCards = (p.amenities || []).slice(0, 3);
  const amenityChips = (p.amenities || []).slice(3);

  // A project can carry its own real, hand-written FAQs (e.g. from a
  // dedicated real-site page) — use those verbatim when present; otherwise
  // fall back to auto-generating sensible ones from the project's own data.
  const faqs = p.faqs?.length ? p.faqs : [
    { q: `Where is ${p.name} located?`, a: `${p.name} is located in ${p.location}.` },
  ];
  if (!p.faqs?.length) {
    if (bhkStat) {
      const bits = [];
      if (unitStat) bits.push(`${unitStat.v} ${unitStat.l.toLowerCase()}`);
      bits.push(`${bhkStat.v} BHK ${unitWord}s`);
      if (sqftStat) bits.push(`ranging from ${sqftStat.v} sq. ft.`);
      if (floorStat) bits.push(`with a ${floorStat.v} structure`);
      faqs.push({ q: `What ${unitWord} types are available?`, a: `${p.name} offers ${bits.join(', ')}.` });
    }
    if (p.amenities?.length) faqs.push({ q: 'Are there community amenities?', a: `Yes — ${p.amenities.join(', ')}.` });
    if (p.description) faqs.push({ q: `What makes ${p.name} special?`, a: p.description });
    faqs.push({ q: `How do I book ${/^[aeiou]/i.test(unitWord) ? 'an' : 'a'} ${unitWord}?`, a: 'Schedule a site visit or contact the sales team directly at +91 89398 56789 to explore availability and booking details.' });
  }

  return (
    <div className="pd2" ref={ref}>
      {/* HERO */}
      <section className="pd2-section pd2-hero">
        <div className="pd2-container">
          <div>
            {p.logo && <img className="pd2-logo" src={p.logo} alt={p.logoAlt || `${p.name} logo`} />}
            <div className="pd2-kicker">{p.name.toUpperCase()} · {p.location.toUpperCase()}</div>
            <h1>
              {p.name && <span>{p.name}</span>}
              {p.tagline && <> <span className="pd2-script">{p.tagline}</span></>}
            </h1>
            {p.description && <p>{p.description}</p>}
            <div className="pd2-actions">
              <Link className="pd2-btn pd2-green" to="/contact">ENQUIRE NOW</Link>
              <a className="pd2-btn pd2-ghost" href="#pd2-plans">EXPLORE FLOOR PLANS</a>
            </div>
            {priceStat && <div className="pd2-hero-stats"><div><strong>{priceStat.v}*</strong><small>STARTING PRICE</small></div></div>}
          </div>
          <div className="pd2-media">
            {p.coverImage ? (
              <img src={p.coverImage} alt={p.name} />
            ) : (
              <TypeIcon category={p.category} />
            )}
          </div>
        </div>
      </section>

      {/* VILLAS/OVERVIEW + STATS */}
      <section className="pd2-section pd2-villas">
        <div className="pd2-container">
          <div className="pd2-center rv"><div className="pd2-kicker">{p.name.toUpperCase()}</div><h2 className="pd2-title">Spaces Built for <span className="pd2-script">Real Living</span></h2></div>
          <div className="pd2-villas-copy rv">
            <div>
              {p.description && <p>{p.description}</p>}
              <Link className="pd2-btn pd2-green" to="/contact" style={{ marginTop: 18 }}>BOOK A SITE VISIT</Link>
            </div>
            <div className="pd2-project-image">
              {p.coverImage ? <img src={p.coverImage} alt={p.name} /> : <TypeIcon category={p.category} size={64} />}
            </div>
          </div>
          {statTiles.length > 0 && (
            <div className="pd2-stats rv">
              {statTiles.map((s) => <div className="pd2-stat" key={s.l}><small>{s.l.toUpperCase()}</small><strong>{s.v}</strong></div>)}
            </div>
          )}
        </div>
      </section>

      {/* VIDEO / MEDIA BAR */}
      {(mediaButtons.length > 0 || m.gmap) && (
        <div className="pd2-video-bar">
          <div className="pd2-video-actions">
            {mediaButtons.map((btn) => (
              <button key={btn.label} type="button" onClick={() => setModalItem(btn)}>{btn.label}</button>
            ))}
            {m.gmap && <a href={m.gmap} target="_blank" rel="noopener noreferrer">📍 View on Map</a>}
            <Link to="/contact">Book a Site Visit</Link>
          </div>
        </div>
      )}

      {/* LOCATION */}
      {bucketKeys.length > 0 && (
        <section className="pd2-section pd2-location">
          <div className="pd2-container">
            <div className="pd2-location-head rv"><div className="pd2-kicker">LOCATION THAT</div><h2 className="pd2-title">Defines <span className="pd2-script">Living</span></h2></div>
            {bucketKeys.length > 1 && (
              <>
                <div className="pd2-time-tabs rv" aria-label="Travel time filters">
                  {bucketKeys.map((k) => (
                    <button key={k} type="button" className={`pd2-time-tab ${activeBucket === k ? 'active' : ''}`} onClick={() => setTimeBucket(k)}>{k}</button>
                  ))}
                </div>
                <p className="pd2-filter-help">Tap a time to see what is nearby.</p>
              </>
            )}
            <div className="pd2-loc-panel rv">
              <div className="pd2-loc-list">
                {(nearbyBuckets[activeBucket] || []).map((item) => <div key={item.n}>{item.n}<span>{item.t}</span></div>)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FLOOR PLANS */}
      {bhkNums.length > 0 && (
        <section className="pd2-section pd2-plans" id="pd2-plans">
          <div className="pd2-container">
            <div className="pd2-center rv"><div className="pd2-kicker">{p.name.toUpperCase()}'S</div><h2 className="pd2-title">Spaces Designed for <span className="pd2-script">Comfort</span></h2></div>
            <div className="pd2-plan-shell rv">
              <div className="pd2-tabs" role="tablist">
                {bhkNums.map((n) => <button key={n} type="button" className={activeBhk === n ? 'active' : ''} onClick={() => setBhk(n)}>{n} BHK</button>)}
              </div>
              <div className="pd2-plan-content">
                <div className="pd2-plan-img">
                  {planImg ? <img src={planImg} alt={`${p.name} floor plan`} /> : <TypeIcon category={p.category} size={56} />}
                </div>
                <div className="pd2-plan-details">
                  <h3>{activeBhk} BHK {p.category === 'villa' ? 'VILLA' : 'APARTMENT'}</h3>
                  <p>{planText(activeBhk)}</p>
                  <Link className="pd2-btn pd2-green" to="/contact">REQUEST DETAILED FLOOR PLAN</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AMENITIES */}
      {p.amenities?.length > 0 && (
        <section className="pd2-section pd2-amenities">
          <div className="pd2-container">
            <div className="pd2-center rv"><div className="pd2-kicker">{p.name.toUpperCase()}</div><h2 className="pd2-title">Spaces <span className="pd2-script">Designed</span> for Living</h2></div>
            <div className="pd2-amenity-grid rv">
              {amenityCards.map((a) => (
                <article className="pd2-amenity" key={a}>
                  {p.coverImage ? <img src={p.coverImage} alt={a} /> : <div className="pd2-amenity-media"><TypeIcon category={p.category} size={44} /></div>}
                  <div className="pd2-amenity-label">{a}</div>
                </article>
              ))}
            </div>
            {amenityChips.length > 0 && (
              <div className="pd2-amenity-chips rv">{amenityChips.map((a) => <span key={a}>{a}</span>)}</div>
            )}
          </div>
        </section>
      )}

      {/* SPECIFICATIONS */}
      <section className="pd2-section pd2-specs">
        <div className="pd2-container">
          <div className="pd2-center rv">
            <div className="pd2-kicker">SPECIFICATIONS</div>
            <h2 className="pd2-title">Solid <span className="pd2-script">Foundations</span> Finishes</h2>
            <p className="pd2-spec-intro">Swipe through the construction details, finishes and fixtures that shape every ATH home.</p>
          </div>
          <div className="rv"><SpecsCarousel image={p.coverImage} /></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pd2-section pd2-faq">
        <div className="pd2-container">
          <div className="pd2-center rv"><div className="pd2-kicker">FAQS</div><h2 className="pd2-title">Clear <span className="pd2-script">Answers</span>, Real</h2></div>
          <div className="pd2-faq-grid rv">
            {faqs.map((item, i) => (
              <div className={`pd2-faq-item ${openFaq === i ? 'open' : ''}`} key={item.q}>
                <button type="button" className="pd2-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {item.q}<span>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="pd2-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="pd2-section" style={{ background: '#fff' }}>
          <div className="pd2-container">
            <div className="pd2-center rv"><div className="pd2-kicker">FROM OUR HOMEOWNERS</div><h2 className="pd2-title">What Our <span className="pd2-script">Homeowners</span> Say</h2></div>
            <div className="rv"><TestimonialGrid testimonials={testimonials} /></div>
          </div>
        </section>
      )}

      {/* ENQUIRE */}
      <section className="pd2-section" style={{ background: '#fff' }}>
        <div className="pd2-container" style={{ maxWidth: 560 }}>
          <div className="pd2-center rv"><div className="pd2-kicker">ENQUIRE</div><h2 className="pd2-title" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Book a Visit to <span className="pd2-script">{p.name}</span></h2></div>
          <div className="form-card rv">
            {p.formId ? (
              <DynamicForm formId={p.formId} source={`Project: ${p.name}`} />
            ) : (
              <ContactForm2 source={`Project: ${p.name}`} interestOptions={[p.category === 'villa' ? 'Villas' : 'Apartments', 'Site Visit', 'Brochure']} />
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pd2-section pd2-cta">
        <div className="pd2-container rv">
          <div className="pd2-kicker">{p.location.toUpperCase()}</div>
          <h2>Begin Your <span className="pd2-script">Journey</span></h2>
          <p>Step in. See. Feel your home.</p>
          <div className="pd2-actions">
            <a className="pd2-btn pd2-green" href="tel:+918939856789">CALL +91 89398 56789</a>
            <a className="pd2-btn pd2-ghost" href="mailto:sales@assettreehomes.com">EMAIL SALES</a>
          </div>
        </div>
      </section>

      <VideoModal item={modalItem} onClose={() => setModalItem(null)} />
    </div>
  );
}
