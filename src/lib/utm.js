// Captures campaign attribution params from the URL on first landing and
// keeps them for the rest of the session, so a lead submitted several pages
// later (e.g. after browsing /projects) still carries the ad campaign that
// brought the visitor in. First-touch semantics: once a param is captured it
// is not overwritten by a later, param-less navigation within the same tab.

const STORAGE_KEY = 'ath_cms_utm';
const TRACKED_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

export function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const found = {};
  TRACKED_KEYS.forEach((key) => {
    const val = params.get(key);
    if (val) found[key] = val;
  });
  if (Object.keys(found).length === 0) return getUtmParams();

  const existing = getUtmParams();
  const merged = { ...found, ...existing }; // first touch wins for any key already stored
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function getUtmParams() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Builds a short, human-readable label for CRM notes/source fields, e.g.
// "google / cpc / feathers-launch" — falls back to null when nothing was captured.
export function utmLabel(utm = getUtmParams()) {
  const parts = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean);
  if (parts.length === 0 && (utm.gclid || utm.fbclid)) return utm.gclid ? 'google-ads (gclid)' : 'facebook-ads (fbclid)';
  return parts.length ? parts.join(' / ') : null;
}
