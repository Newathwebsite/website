// Inline SEO guidance shown directly under a meta title/description field —
// no separate report needed to see whether a value is in the right range.
const RANGES = {
  title: { min: 40, max: 60, tip: 'Meta titles that display fully in Google are usually 40–60 characters.' },
  description: { min: 140, max: 160, tip: 'Meta descriptions that display fully are usually 140–160 characters.' },
  slug: { min: 3, max: 60, tip: 'Short, lowercase, hyphenated slugs (e.g. ath-feathers) are easiest to read and rank.' },
};

export default function SeoHint({ kind, value }) {
  const range = RANGES[kind];
  if (!range) return null;
  const len = (value || '').length;
  const status = len === 0 ? 'empty' : len < range.min ? 'short' : len > range.max ? 'long' : 'good';
  const color = { empty: 'var(--a-muted)', short: '#a9744c', long: '#b03232', good: '#2f8b52' }[status];
  const label = { empty: 'Not set yet', short: `A bit short (${len} chars)`, long: `A bit long (${len} chars)`, good: `Good length (${len} chars)` }[status];

  return (
    <div style={{ fontSize: '.74rem', color, marginTop: 4 }}>
      {label} — {range.tip}
    </div>
  );
}
