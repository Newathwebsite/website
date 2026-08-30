import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import VideoSplash from './VideoSplash';
import Modal from './Modal';
import EnquireForm from './EnquireForm';
import '../../../styles/feathers.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HERO_SLIDES = [
  { src: '/assets/slide-entrance.jpg', alt: 'ATH Feathers — gated community entrance arch, Kundrathur' },
  { src: '/assets/slide-villa.jpg', alt: 'ATH Feathers — independent villa elevation at dusk' },
  { src: '/assets/slide-clubhouse.jpg', alt: 'ATH Feathers — community clubhouse with gym' },
  { src: '/assets/slide-street.jpg', alt: 'ATH Feathers — villa street view' },
];

const DFY_CARDS = [
  { icon: <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />, title: 'Exquisitely Designed Premium Residences', body: 'Architecture that balances elegance with everyday practicality.' },
  { icon: <><path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M19 12h2M17 7l1.4-1.4M7 18a5 5 0 0 1 10 0" /><path d="M3 21h18" /></>, title: 'Serene Ambience for Peaceful Living', body: 'A quiet enclave away from the chaos, close to everything.' },
  { icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></>, title: 'World-Class Amenities for Modern Living', body: 'Gym, yoga hut, play areas and more — thoughtfully curated.' },
  { icon: <><path d="M4 20h16M6 20V9h12v11M9 9V4h6v5" /></>, title: 'Rooftop Escape for Ultimate Rejuvenation', body: 'Your own sky deck — sunsets, stars and open-air evenings.' },
];

const AMENITIES = [
  { icon: <path d="M6 7h12M6 17h12M8 7v10M16 7v10M3 9v6M21 9v6" />, label: 'Modern Gym' },
  { icon: <><circle cx="12" cy="6" r="2.4" /><path d="M5 21c1.5-4 4-6 7-6s5.5 2 7 6M9 13.5 5.5 11M15 13.5 18.5 11" /></>, label: 'Yoga Hut' },
  { icon: <path d="M4 20 20 4M4 4c6 0 8 3 8 8M20 20c-6 0-8-3-8-8" />, label: "Children's Play Area" },
  { icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></>, label: 'Board Games Room' },
  { icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" /></>, label: 'Association Room' },
  { icon: <><path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" /><path d="m9 12 2 2 4-4" /></>, label: 'Security Cameras' },
  { icon: <><rect x="7" y="2" width="10" height="20" rx="2" /><circle cx="12" cy="9" r="2.6" /><path d="M12 15h.01" /></>, label: 'Video Door Phone' },
  { icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>, label: 'Solar Power Fence' },
  { icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />, label: 'Charging Point' },
];

const WHY_ITEMS = [
  { title: '100% Freehold Ownership', body: 'The land and the villa, both in your name.' },
  { title: 'Built for Generations', body: 'Quality construction that lasts, and grows with your family.' },
  { title: 'Your Sky, Your Rules', body: 'Independent homes with your own rooftop and open space.' },
  { title: 'Freedom to Modify', body: 'Personalise your home the way your family lives.' },
  { title: 'A Home That Grows With You', body: 'Space and flexibility for every stage of life.' },
  { title: 'CREDAI Member Developer', body: '20+ years of expertise · 100+ completed projects · 1000+ happy customers.' },
];

const FAQS = [
  { q: 'Where is ATH Feathers located?', a: 'In Kundrathur, Chennai — 5 minutes from ORR and the Kundrathur bus depot, 15 minutes from Porur, and 20 minutes from the airport and major IT parks (DLF, RMZ, L&T).' },
  { q: 'What is the price of the villas?', a: 'Ultra luxury 3 BHK villas start from ₹1.40 Crore and 4 BHK villas from ₹1.63 Crore.' },
  { q: 'What configurations are available?', a: "3 and 4 BHK ultra luxurious independent villas — within Kundrathur's only gated community." },
  { q: 'What makes Feathers different?', a: 'It is the only gated community villa project in Kundrathur — with 100% freehold land and villa ownership, freedom to modify, and world-class community amenities.' },
  { q: 'How can I book a site visit?', a: 'Share your details through the enquiry form on this page and our team will call you back within one business day.' },
];

function FaqItem({ item, isOpen, onToggle }) {
  const bodyRef = useRef(null);

  useGSAP(() => {
    if (!bodyRef.current) return;
    gsap.to(bodyRef.current, {
      height: isOpen ? 'auto' : 0,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  }, [isOpen]);

  return (
    <div className={`f-faq-item ${isOpen ? 'open' : ''}`}>
      <button className="f-faq-q" onClick={onToggle}>
        {item.q} <span className="x">+</span>
      </button>
      <div className="f-faq-a" ref={bodyRef} style={{ height: 0, overflow: 'hidden' }}>
        <p>{item.a}</p>
      </div>
    </div>
  );
}

export default function FeathersLanding() {
  const rootRef = useRef(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'ATH Feathers | 3 & 4 BHK Gated Community Villas in Kundrathur, Chennai | Asset Tree Homes';
    let meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'ATH Feathers — the only gated community villas in Kundrathur. Ultra luxury 3 BHK from ₹1.40 Cr & 4 BHK from ₹1.63 Cr. 5 min to ORR, 20 min to Airport. CREDAI member.');
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc !== undefined) meta.setAttribute('content', prevDesc || '');
    };
  }, []);

  useEffect(() => {
    if (!videoOpen && modalVideoRef.current) {
      try { modalVideoRef.current.pause(); } catch (e) { /* noop */ }
    } else if (videoOpen && modalVideoRef.current) {
      try { modalVideoRef.current.play(); } catch (e) { /* noop */ }
    }
  }, [videoOpen]);

  useGSAP(() => {
    // Hero entrance
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.f-hero-anim .f-eyebrow', { opacity: 0, y: 16, duration: 0.7 })
      .from('.f-hero-anim .sig', { opacity: 0, y: 16, duration: 0.7 }, '-=0.5')
      .from('.f-hero-anim h1', { opacity: 0, y: 20, duration: 0.8 }, '-=0.5')
      .from('.f-hero-anim .hero-sub', { opacity: 0, y: 16, duration: 0.6 }, '-=0.5')
      .from('.f-hero-anim .price-chip', { opacity: 0, y: 16, stagger: 0.12, duration: 0.6 }, '-=0.4')
      .from('.f-hero-anim .price-cta', { opacity: 0, scale: 0.9, duration: 0.5 }, '-=0.3');

    // Scroll-triggered reveals for every section, batched for perf
    ScrollTrigger.batch('.f-rv', {
      start: 'top 85%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }),
    });
    gsap.set('.f-rv', { opacity: 0, y: 28 });

    // Subtle parallax on the hero image (targets the slide container, not
    // .slide.on, since which element carries that class changes every 4.5s
    // as the carousel advances — animating the container keeps it stable).
    gsap.to('.hero-slides', {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.f-hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }, { scope: rootRef });

  const toggleFaq = (i) => setOpenFaq((cur) => (cur === i ? null : i));

  return (
    <div className="feathers-lp" ref={rootRef}>
      <VideoSplash />

      <nav className="f-nav">
        <div className="f-brand">
          <img className="feathers" src="/assets/feathers-logo.png" alt="Feathers by Asset Tree Homes" />
        </div>
        <button className="nav-cta" onClick={() => setEnquiryOpen(true)}>Book a Site Visit</button>
      </nav>

      <header className="f-hero">
        <div className="hero-media">
          <div className="hero-slides">
            {HERO_SLIDES.map((s, i) => (
              <img key={s.src} className={`slide ${i === slideIdx ? 'on' : ''}`} src={s.src} alt={s.alt} />
            ))}
          </div>
          <div className="f-hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={i === slideIdx ? 'on' : ''} onClick={() => setSlideIdx(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <button className="hero-play" onClick={() => setVideoOpen(true)}><span className="tri" /> Watch Walkthrough</button>
          <div className="hero-copy f-hero-anim">
            <div className="f-eyebrow">ATH Feathers &middot; Kundrathur, Chennai</div>
            <div className="sig">The Address Few Can Own</div>
            <h1>The only <em>gated community villas</em> in Kundrathur</h1>
            <p className="hero-sub">Ultra luxurious 3 &amp; 4 BHK independent villas</p>
            <div className="hero-price">
              <div className="price-chip"><div className="pc-l">3 BHK Villas</div><div className="pc-v">₹1.40 Cr <span>onwards*</span></div></div>
              <div className="price-chip"><div className="pc-l">4 BHK Villas</div><div className="pc-v">₹1.63 Cr <span>onwards*</span></div></div>
              <button className="price-cta" onClick={() => setEnquiryOpen(true)}>
                Book a Site Visit
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="hstrip">
        <div className="wrap">
          <div className="hs-item"><div className="hm"><b>5</b><span>min</span></div><div className="hl">Outer Ring Road (ORR)</div></div>
          <div className="hs-item"><div className="hm"><b>5</b><span>min</span></div><div className="hl">Kundrathur Bus Depot</div></div>
          <div className="hs-item"><div className="hm"><b>15</b><span>min</span></div><div className="hl">Porur</div></div>
          <div className="hs-item"><div className="hm"><b>20</b><span>min</span></div><div className="hl">DLF &middot; RMZ &middot; L&amp;T</div></div>
          <div className="hs-item"><div className="hm"><b>20</b><span>min</span></div><div className="hl">Chennai Airport</div></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-img f-rv">
              <img src="/assets/feathers-elevation.jpg" alt="ATH Feathers — gated community entrance arch with Feathers signage, Kundrathur, Chennai" loading="lazy" />
            </div>
            <div className="about-copy f-rv">
              <div className="f-eyebrow">ATH Feathers</div>
              <h2>Villas for sale in <em>Kundrathur</em></h2>
              <p>While buying great flats in a metropolis can be tempting, nothing compares to owning your own villa — your land, your home, your rules. If you're looking for that kind of home, <b>ATH Feathers — Kundrathur</b> is your stop point.</p>
              <p>Especially if you're searching for villas in and around Chennai's fast-growing western corridor, this is where your property search ends. Set between the Chennai Airport and the upcoming Parandur Airport axis, Kundrathur is positioned as the future metro gateway — and Feathers is its only gated community villa address.</p>
              <p>We designed our villas with excellent ventilation and abundant natural light, complete with the amenities modern families expect — all within a secure, well-planned community.</p>
            </div>
          </div>
          <div className="canvas-card f-rv" style={{ marginTop: 28 }}>
            <span className="sig">Canvas of Calm</span>
            <p>Nestled in the serene enclave of Kundrathur, ATH Feathers is a tranquil retreat that emerges from a sanctuary of calm. Inspired by minimal elegance and mindful design, every villa is drawn on a canvas of open skies, natural light and gently rustling greens.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="titler f-rv"><div className="the">ATH Feathers</div><h2>Designed <em>for you</em></h2></div>
          <div className="dfy">
            {DFY_CARDS.map((c) => (
              <div className="dfy-card f-rv" key={c.title}>
                <div className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{c.icon}</svg></div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec amen-sec">
        <div className="wrap">
          <div className="titler f-rv"><div className="the">Everything within</div><h2>Amenities that <em>elevate</em> everyday life</h2></div>
          <div className="amen-grid">
            {AMENITIES.map((a) => (
              <div className="amen-tile f-rv" key={a.label}>
                <div className="ai"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{a.icon}</svg></div>
                <b>{a.label}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lux">
        <div className="wrap f-rv">
          <div className="k">For those who always want</div>
          <h2>More <em>Luxury</em></h2>
          <p>Experience the kind of happiness that only comes from being part of a community that cares. ATH Feathers offers a range of amenities designed to enhance your comfort and convenience. Our commitment to creating a lifestyle that fosters joy, relaxation and connection is reflected in every aspect of the community and its state-of-the-art amenities.</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="titler f-rv"><div className="the">Location</div><h2>Location that <em>defines living</em></h2><p>Near all you need, beyond the usual.</p></div>
          <div className="loc-rows">
            <div className="loc-row f-rv">
              <div className="loc-badge"><div className="only">Only</div><b>05</b><span>mins</span></div>
              <div className="loc-list">
                <div>Outer Ring Road (ORR)</div><div>Kundrathur Bus Depot</div><div>Kundrathur Murugan Temple</div>
              </div>
            </div>
            <div className="loc-row f-rv">
              <div className="loc-badge"><div className="only">Only</div><b>15</b><span>mins</span></div>
              <div className="loc-list">
                <div>Porur Junction</div><div>Upcoming Metro Station</div><div>Sri Ramachandra Medical College &amp; Hospital</div>
              </div>
            </div>
            <div className="loc-row f-rv">
              <div className="loc-badge"><div className="only">Only</div><b>20</b><span>mins</span></div>
              <div className="loc-list">
                <div>IT Parks — DLF &middot; RMZ &middot; L&amp;T</div><div>Chennai Airport</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="titler f-rv">
            <div className="the">Kundrathur</div>
            <h2>The future <em>metro gateway</em></h2>
            <p>Between Chennai Airport &amp; the upcoming Parandur Airport — direct airport connectivity, 5 major highways &amp; ORR access, and strong appreciation potential on the Chennai–Parandur axis.</p>
          </div>
          <div className="map-card f-rv">
            <iframe
              src="https://www.google.com/maps?q=Feathers+ATH+Private+Limited,+Kundrathur,+Chennai&z=15&output=embed"
              width="100%" height="440" style={{ border: 0, display: 'block' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="ATH Feathers location — Kundrathur, Chennai"
            />
            <div className="map-actions">
              <a className="map-btn" href="https://maps.app.goo.gl/5YfBgcS7CVcFUuNq5" target="_blank" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                Get Directions on Google Maps
              </a>
              <button className="map-btn ghost" onClick={() => setEnquiryOpen(true)}>Plan My Site Visit</button>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="titler f-rv"><div className="the">Step inside</div><h2>Project <em>walkthrough</em></h2></div>
          <div className="walk-card f-rv">
            <video src="/assets/feathers-walkthrough.mp4" poster="/assets/walkthrough-poster.jpg" controls preload="metadata" playsInline />
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="titler f-rv">
            <div className="the">Why choose Feathers</div>
            <h2>Crafted with care, <em>chosen with confidence</em></h2>
            <p>Homes that protect your values, and a legacy you can truly call your own.</p>
          </div>
          <div className="why-grid">
            {WHY_ITEMS.map((w) => (
              <div className="why-item f-rv" key={w.title}>
                <div className="wn">✦</div>
                <div><b>{w.title}</b><span>{w.body}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="wrap f-rv">
          <span className="sig">The Address Few Can Own</span>
          <h2>Own Kundrathur's only gated community villa</h2>
          <button className="closing-cta" onClick={() => setEnquiryOpen(true)}>
            Book Your Private Site Visit
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="titler f-rv"><div className="the">Good to know</div><h2>Frequently asked <em>questions</em></h2></div>
          <div className="f-faq f-rv">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} item={item} isOpen={openFaq === i} onToggle={() => toggleFaq(i)} />
            ))}
          </div>
        </div>
      </section>

      <footer className="f-footer">
        <div className="wrap">
          <div className="flogos">
            <img src="/assets/feathers-logo.png" alt="Feathers" />
            <img src="/assets/ath-logo.png" alt="ATH Pvt Ltd" />
          </div>
          <p>
            <b>ATH Feathers</b> &middot; Kundrathur, Chennai<br />
            A project by <b>Asset Tree Homes</b> — Your Imagination Is Our Creation<br />
            CREDAI Member &middot; 20+ Years of Expertise &middot; 100+ Completed Projects &middot; 1000+ Happy Customers<br />
            &copy; 2026 ATH Pvt Ltd. All rights reserved. *Prices indicative, subject to change.
          </p>
        </div>
      </footer>

      <Modal open={enquiryOpen} onClose={() => setEnquiryOpen(false)}>
        <div className="modal-form-body">
          <div className="f-eyebrow">Enquire now</div>
          <h2>Book your <em>site visit</em></h2>
          <p className="fsub">Share your details — our team will call you back within 1 business day.</p>
          <EnquireForm onSuccess={() => setEnquiryOpen(false)} />
        </div>
      </Modal>

      <Modal open={videoOpen} onClose={() => setVideoOpen(false)} variant="video">
        <video ref={modalVideoRef} src="/assets/feathers-walkthrough.mp4" poster="/assets/walkthrough-poster.jpg" controls preload="none" playsInline />
      </Modal>
    </div>
  );
}
