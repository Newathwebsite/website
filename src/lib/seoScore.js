// A real, weighted SEO score (0-100) per page/project/blog post — distinct
// from the Site Audit's pass/fail findings list, which flags missing fields
// but doesn't say how WELL the filled-in ones are optimized (title/
// description length is what search engines actually truncate on).
const CHECKS = [
  { key: 'title', weight: 15, label: 'Has a title/heading' },
  { key: 'metaTitle', weight: 15, label: 'Meta title set, ~30-60 characters' },
  { key: 'metaDescription', weight: 20, label: 'Meta description set, ~120-160 characters' },
  { key: 'content', weight: 15, label: 'Has real body content (50+ characters)' },
  { key: 'image', weight: 15, label: 'Has a cover image' },
  { key: 'imageAlt', weight: 10, label: 'Cover image has alt text' },
  { key: 'slug', weight: 10, label: 'Clean URL slug (lowercase, hyphenated)' },
];

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// `item` is normalized to { title, metaTitle, metaDescription, content,
// image, imageAlt, slug, hasImageField } before scoring — see the three
// adapters below (project/page/blogPost).
function scoreItem(item) {
  const results = [];
  const pass = (key, ok, detail) => results.push({ key, ok, detail, ...CHECKS.find((c) => c.key === key) });

  pass('title', !!item.title, item.title ? 'Present' : 'Missing');

  const mtLen = (item.metaTitle || '').length;
  pass('metaTitle', mtLen >= 30 && mtLen <= 60, !item.metaTitle ? 'Not set' : mtLen < 30 ? `Too short (${mtLen} chars)` : mtLen > 60 ? `Too long (${mtLen} chars, may be truncated)` : `Good length (${mtLen} chars)`);

  const mdLen = (item.metaDescription || '').length;
  pass('metaDescription', mdLen >= 120 && mdLen <= 160, !item.metaDescription ? 'Not set' : mdLen < 120 ? `Too short (${mdLen} chars)` : mdLen > 160 ? `Too long (${mdLen} chars, may be truncated)` : `Good length (${mdLen} chars)`);

  const contentLen = (item.content || '').length;
  pass('content', contentLen >= 50, contentLen === 0 ? 'Missing' : contentLen < 50 ? `Too thin (${contentLen} chars)` : 'Sufficient');

  if (item.hasImageField === false) {
    // Not every content type carries its own cover image (e.g. a simple
    // page) — skip those two checks instead of penalizing for a field that
    // was never meant to exist, and rescale the remaining weight to 100.
    const applicable = CHECKS.filter((c) => c.key !== 'image' && c.key !== 'imageAlt');
    const totalWeight = applicable.reduce((s, c) => s + c.weight, 0);
    pass('slug', SLUG_RE.test(item.slug || ''), item.slug ? (SLUG_RE.test(item.slug) ? 'Clean' : 'Contains uppercase/spaces/special characters') : 'No slug');
    const earned = results.reduce((s, r) => s + (r.ok ? r.weight : 0), 0);
    return { score: Math.round((earned / totalWeight) * 100), checks: results };
  }

  pass('image', !!item.image, item.image ? 'Present' : 'Missing');
  pass('imageAlt', !!item.image && !!item.imageAlt, !item.image ? 'N/A (no image)' : item.imageAlt ? 'Present' : 'Missing');
  pass('slug', SLUG_RE.test(item.slug || ''), item.slug ? (SLUG_RE.test(item.slug) ? 'Clean' : 'Contains uppercase/spaces/special characters') : 'No slug');

  const earned = results.reduce((s, r) => s + (r.ok ? r.weight : 0), 0);
  return { score: Math.round(earned), checks: results };
}

export function scoreProject(p) {
  return scoreItem({
    title: p.name, metaTitle: p.metaTitle, metaDescription: p.metaDescription,
    content: p.description, image: p.coverImage, imageAlt: p.coverImageAlt, slug: p.slug,
  });
}

export function scorePage(p) {
  return scoreItem({
    title: p.title, metaTitle: p.metaTitle, metaDescription: p.metaDescription,
    content: p.subtitle, image: null, imageAlt: null, slug: p.slug, hasImageField: false,
  });
}

export function scoreBlogPost(b) {
  return scoreItem({
    title: b.title, metaTitle: b.metaTitle, metaDescription: b.metaDescription,
    content: b.content || b.excerpt, image: b.coverImage, imageAlt: b.coverImageAlt, slug: b.slug,
  });
}

export function scoreLabel(score) {
  if (score >= 80) return { label: 'Good', color: '#2f8b52' };
  if (score >= 50) return { label: 'Needs work', color: '#a9744c' };
  return { label: 'Poor', color: '#b03232' };
}
