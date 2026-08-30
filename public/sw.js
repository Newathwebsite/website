// Service worker: makes the site installable as a PWA and handles real Web
// Push notifications (received here even if no tab is open). Kept as a
// plain classic script (not an ES module) for the widest browser support.

const DB_NAME = 'ath_notifications';
const STORE = 'items';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeNotification(data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: data.title,
      body: data.body,
      url: data.url || '/',
      read: false,
      receivedAt: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Asset Tree Homes', body: 'You have a new update.', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* non-JSON payload — fall back to defaults */ }

  event.waitUntil(
    Promise.all([
      storeNotification(data),
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/ath-logo.png',
        badge: '/assets/ath-logo.png',
        data: { url: data.url },
      }),
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'ath-push-received' }));
      }),
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(url); return; }
      return self.clients.openWindow(url);
    })
  );
});
