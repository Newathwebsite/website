import { useEffect, useRef, useState } from 'react';
import { getAllNotifications, markAllRead } from '../../../lib/notifications';
import { getSubscription, pushSupported, subscribeToPush, unsubscribeFromPush } from '../../../lib/push';

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const boxRef = useRef(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const refresh = () => {
    if (!pushSupported()) return;
    getAllNotifications().then(setItems).catch(() => {});
    getSubscription().then((s) => setSubscribed(!!s)).catch(() => {});
  };

  useEffect(() => {
    refresh();
    if (!pushSupported()) return;
    const onMessage = (e) => { if (e.data?.type === 'ath-push-received') refresh(); };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => { if (open && boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await markAllRead();
      refresh();
    }
  };

  const enable = async () => {
    setBusy(true);
    setError(null);
    try {
      await subscribeToPush();
      setSubscribed(true);
    } catch (e) {
      setError(e.message || 'Could not enable notifications.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await unsubscribeFromPush();
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  };

  if (!pushSupported()) return null;

  return (
    <div className="ath-notif" ref={boxRef}>
      <button type="button" className="ath-notif-bell" aria-label="Notifications" onClick={toggle}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        {unreadCount > 0 && <span className="ath-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="ath-notif-panel">
          {!subscribed ? (
            <div className="ath-notif-enable">
              <p>Turn on notifications for launch news, offers and updates.</p>
              {error && <p className="ath-notif-error">{error}</p>}
              <button type="button" className="btn btn-primary" disabled={busy} onClick={enable}>{busy ? 'Enabling…' : 'Enable Notifications'}</button>
            </div>
          ) : items.length === 0 ? (
            <div className="ath-notif-empty">No notifications yet.</div>
          ) : (
            <>
              <div className="ath-notif-list">
                {items.slice(0, 12).map((n) => (
                  <a key={n.id} href={n.url} className="ath-notif-item">
                    <b>{n.title}</b>
                    <span>{n.body}</span>
                    <small>{timeAgo(n.receivedAt)}</small>
                  </a>
                ))}
              </div>
              <button type="button" className="ath-notif-off" disabled={busy} onClick={disable}>Turn off notifications</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
