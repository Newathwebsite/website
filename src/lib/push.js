// Client side of Web Push: registers the service worker, subscribes the
// browser for push, and sends the subscription to ath-ai-server so admin can
// later fan out a real notification to it. See ath-ai-server/server.js.
const API_BASE = import.meta.env.VITE_AI_API_URL || '';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_PROXY_TOKEN || '';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function registerServiceWorker() {
  if (!pushSupported()) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function getSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function subscribeToPush() {
  if (!pushSupported()) throw new Error('Push notifications are not supported in this browser.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const reg = await navigator.serviceWorker.ready;
  const keyRes = await fetch(`${API_BASE}/api/push/vapid-key`);
  const { publicKey } = await keyRes.json();
  if (!publicKey) throw new Error('Server has no VAPID key configured yet.');

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await fetch(`${API_BASE}/api/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });

  return subscription;
}

export async function unsubscribeFromPush() {
  const sub = await getSubscription();
  if (!sub) return;
  await fetch(`${API_BASE}/api/push/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
}

// Admin-only: fan out a real notification to every subscribed browser.
export async function sendPushToAll({ title, body, url }) {
  const res = await fetch(`${API_BASE}/api/push/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_TOKEN ? { 'x-ath-admin-token': ADMIN_TOKEN } : {}),
    },
    body: JSON.stringify({ title, body, url }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Send failed (${res.status})`);
  return data;
}

export async function getSubscriberCount() {
  const res = await fetch(`${API_BASE}/api/push/subscriber-count`, {
    headers: { ...(ADMIN_TOKEN ? { 'x-ath-admin-token': ADMIN_TOKEN } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  return data.count ?? 0;
}
