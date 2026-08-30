import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useData } from '../../../context/DataContext';
import NotificationBell from './NotificationBell';

const MOBILE_QUERY = '(max-width: 900px)';

export default function Nav2() {
  const { settings } = useData();
  const menu = settings.menu || [];
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const linksRef = useRef(null);

  // Below 900px the links panel becomes a fixed-position slide-in drawer —
  // portal it to <body> so it isn't confined by the header's own box
  // (a positioned ancestor would otherwise clip position:fixed children to
  // itself) and so its z-index competes at the page level, not just within
  // the header, letting it sit above the bottom nav / floating buttons.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useGSAP(() => {
    const links = linksRef.current?.querySelectorAll('a:not(.cta)');
    if (!links) return;
    links.forEach((link) => {
      let underline = link.querySelector('.nav-underline');
      if (!underline) {
        underline = document.createElement('span');
        underline.className = 'nav-underline';
        Object.assign(underline.style, { position: 'absolute', left: 0, right: 0, bottom: '-4px', height: '2px', background: 'var(--accent)', transformOrigin: 'left', transform: 'scaleX(0)', pointerEvents: 'none' });
        link.style.position = 'relative';
        link.appendChild(underline);
      }
      const grow = () => gsap.to(underline, { scaleX: 1, duration: 0.25, ease: 'power2.out' });
      const shrink = () => { if (!link.classList.contains('active')) gsap.to(underline, { scaleX: 0, duration: 0.2, ease: 'power2.in' }); };
      if (link.classList.contains('active')) gsap.set(underline, { scaleX: 1 });
      link.addEventListener('mouseenter', grow);
      link.addEventListener('mouseleave', shrink);
    });
  }, { scope: linksRef, dependencies: [settings.menu] });

  // Lock body scroll while the mobile menu is open — otherwise a downward
  // drag on the open menu scrolls the page underneath it, which on mobile
  // browsers can trigger a pull-to-refresh gesture.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehaviorY;
    body.style.overflow = 'hidden';
    body.style.overscrollBehaviorY = 'contain';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.overscrollBehaviorY = prevOverscroll;
    };
  }, [open]);

  const backdrop = <div className={`nav-backdrop ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />;
  const links = (
    <div className={`links ${open ? 'open' : ''}`} ref={linksRef}>
      {menu.map((l) => (
        <NavLink
          key={l.path}
          to={l.path}
          onClick={() => setOpen(false)}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span>{l.label}</span>
        </NavLink>
      ))}
      <NavLink className="btn btn-primary cta" to="/contact" onClick={() => setOpen(false)}>Get in Touch</NavLink>
    </div>
  );

  return (
    <nav className="site-nav">
      <div className="nav-left-slot"><NotificationBell /></div>
      <NavLink className="brand" to="/" onClick={() => setOpen(false)}>
        <img src={settings.logo} alt={settings.siteName} />
      </NavLink>
      {isMobile ? createPortal(<>{backdrop}{links}</>, document.body) : <>{backdrop}{links}</>}
      <button className={`nav-toggle ${open ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span />
      </button>
    </nav>
  );
}
