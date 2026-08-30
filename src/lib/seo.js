// Applies per-page SEO (document.title + meta description) at runtime, since
// this is a client-rendered SPA with no server to set these per-route.
// Call applySeo() in a page's effect, and return resetSeo from the cleanup
// so navigating away restores the site default rather than leaking a stale
// title/description onto the next page.

function getOrCreateMeta(name) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  return meta;
}

export function applySeo({ title, description }) {
  if (title) document.title = title;
  if (description) getOrCreateMeta('description').setAttribute('content', description);
}

export function resetSeo() {
  // Re-read the last-known site defaults, stashed on window by Layout2 when
  // it mounts, so "back to default" doesn't require every page to know them.
  const fallback = window.__athSeoDefault;
  if (fallback) applySeo(fallback);
}
