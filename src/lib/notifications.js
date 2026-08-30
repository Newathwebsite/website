// Reads the same IndexedDB store the service worker (public/sw.js) writes to
// when a push notification arrives — this is how the in-app bell badge knows
// about notifications received while the site was open, or since it was last
// opened. Keep DB_NAME/STORE in sync with sw.js.
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

export async function getAllNotifications() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.receivedAt - a.receivedAt));
    req.onerror = () => reject(req.error);
  });
}

export async function markAllRead() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      req.result.forEach((item) => { if (!item.read) store.put({ ...item, read: true }); });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
