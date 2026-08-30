const PREFIX = 'ath_cms_';

export function loadCollection(key, seed) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read', key, 'from localStorage', e);
  }
  localStorage.setItem(PREFIX + key, JSON.stringify(seed));
  return seed;
}

export function saveCollection(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
