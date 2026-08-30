import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../context/DataContext';

const DISMISS_KEY = 'ath_cms_announcement_dismissed';

// The practical, backend-free stand-in for "push notifications to all
// visitors" — a sitewide banner every visitor sees, no login or install
// required. Real push (reaching people while they're off the site) needs a
// server + saved subscriptions, which this project deliberately doesn't have.
export default function AnnouncementBar() {
  const { settings } = useData();
  const a = settings.announcement;
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  if (!a?.enabled || !a.message || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div style={{ background: 'var(--primary)', color: '#fff', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: '.86rem', flexWrap: 'wrap', textAlign: 'center' }}>
      <span>{a.message}</span>
      {a.ctaLabel && <Link to={a.ctaUrl || '/contact'} style={{ textDecoration: 'underline', fontWeight: 600, flexShrink: 0 }}>{a.ctaLabel}</Link>}
      <button type="button" onClick={dismiss} aria-label="Dismiss" style={{ background: 'none', border: 0, color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>✕</button>
    </div>
  );
}
