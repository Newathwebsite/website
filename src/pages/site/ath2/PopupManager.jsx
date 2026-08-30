import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import ContactForm2 from './ContactForm2';
import DynamicForm from './DynamicForm';

const SEEN_KEY = 'ath_cms_popup_seen';

export default function PopupManager() {
  const { settings } = useData();
  const popup = settings.popup;
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!popup?.enabled) return;
    if (popup.frequency === 'once' && sessionStorage.getItem(SEEN_KEY) === '1') return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SEEN_KEY, '1');
    }, (popup.delaySeconds || 0) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup?.enabled]);

  useGSAP(() => {
    if (!open) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(boxRef.current, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.6)' });
  }, [open]);

  const close = () => {
    gsap.to(boxRef.current, { opacity: 0, y: 16, scale: 0.96, duration: 0.2 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => setOpen(false) });
  };

  if (!popup?.enabled || !open) return null;

  return (
    <div ref={overlayRef} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,12,28,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={boxRef} style={{ background: '#fff', borderRadius: 22, maxWidth: 440, width: '100%', overflow: 'hidden', position: 'relative', boxShadow: '0 30px 80px -20px rgba(10,12,28,.5)' }}>
        <button type="button" aria-label="Close" onClick={close} style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.9)', border: '1px solid #eee', cursor: 'pointer' }}>✕</button>
        {popup.type === 'image' && popup.image && (
          <img src={popup.image} alt={popup.imageAlt || popup.title || ''} style={{ width: '100%', display: 'block' }} />
        )}
        <div style={{ padding: 26 }}>
          {popup.title && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: 8 }}>{popup.title}</h3>}
          {popup.body && <p style={{ color: 'var(--muted)', marginBottom: 18 }}>{popup.body}</p>}
          {popup.type === 'form' ? (
            popup.formId ? <DynamicForm formId={popup.formId} source="Popup" /> : <ContactForm2 source="Popup" />
          ) : (
            popup.ctaLabel && (
              <Link className="btn btn-primary" to={popup.ctaUrl || '/contact'} onClick={close}>{popup.ctaLabel}</Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
