import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../../../context/DataContext';

export default function BottomNav() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { settings } = useData();
  const waDigits = (settings.whatsappNumber || '').replace(/[^\d]/g, '');
  const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(settings.whatsappMessage || "Hi! I'm interested in Asset Tree Homes projects.")}` : null;

  useEffect(() => {
    document.querySelector('.ath2')?.classList.add('has-bottom-nav');
    return () => document.querySelector('.ath2')?.classList.remove('has-bottom-nav');
  }, []);

  const openMenu = () => {
    document.querySelector('.nav-toggle')?.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="ath-bottom-nav" aria-label="Quick actions">
      <Link to="/contact">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
        <span>Enquiry</span>
      </Link>
      <a href="tel:+918939856789">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        <span>Call Us</span>
      </a>
      <Link className={`abn-fab ${isHome ? 'active' : ''}`} to="/" aria-label="Home">
        <span className="abn-fab-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg></span>
        <span>Home</span>
      </Link>
      <Link to="/villas">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
        <span>Projects</span>
      </Link>
      {waHref ? (
        <a href={waHref} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 32 32" fill="currentColor" stroke="none"><path d="M16 3.6C9.7 3.6 4.6 8.7 4.6 15c0 2.2.6 4.3 1.7 6.2l-1.8 6.6 6.8-1.8c1.8 1 3.8 1.5 5.9 1.5 6.3 0 11.4-5.1 11.4-11.4S22.3 3.6 16 3.6zm6.7 16.2c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.1-2.1-.1-.5-.2-1.1-.4-1.9-.7-3.4-1.5-5.6-4.9-5.8-5.1-.2-.2-1.4-1.8-1.4-3.5s.9-2.4 1.2-2.8c.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .8.6.3.7 1 2.4 1.1 2.6.1.2.2.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.6.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.4.5-.3.8-.2.3.1 2 1 2.4 1.1.4.2.6.3.7.4.1.2.1 1-.2 1.8z" /></svg>
          <span>WhatsApp</span>
        </a>
      ) : (
        <button type="button" onClick={openMenu}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span>Menu</span>
        </button>
      )}
    </nav>
  );
}
