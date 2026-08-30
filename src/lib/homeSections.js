// Shared home-page section catalog — used by both the admin editor
// (HomePageAdmin) and the Live Edit "Add Section" panel on the live site,
// so the two never drift out of sync on what section types exist or what a
// freshly-added one starts out containing.
export const SECTION_TYPES = [
  { type: 'banner', label: 'All-Projects Banner', desc: 'Auto-scrolling strip of your published projects.' },
  { type: 'stats', label: 'Stats Band', desc: 'A row of count-up numbers — years of experience, projects, customers…' },
  { type: 'featured', label: 'Featured Projects', desc: 'Swipeable deck or grid of your villas/apartments.' },
  { type: 'precision', label: 'Numbered Feature Grid', desc: 'A numbered list of highlights, e.g. "Why choose us".' },
  { type: 'cta', label: 'Call-to-Action Band', desc: 'Heading, body text and a button — e.g. "Book a Visit".' },
  { type: 'generic', label: 'Custom Section', desc: 'Heading, body text, an image and an optional button.' },
  { type: 'code', label: 'Custom Code', desc: "Paste your own HTML/embed code — rendered exactly as-is." },
];

export const EMPTY_BY_TYPE = {
  banner: { kicker: 'All Projects', heading: 'Discover Your Dream Home' },
  stats: { items: [{ value: '20+', label: 'Years of Expertise' }] },
  featured: { kicker: 'Featured Projects', heading: 'Find your perfect home', body: '', cardStyleDesktop: 'classic', cardStyleMobile: 'classic' },
  precision: { kicker: '', heading: '', body: '', items: [{ title: '', body: '' }] },
  cta: { heading: '', body: '', ctaLabel: 'Get in Touch', ctaUrl: '/contact' },
  generic: { heading: '', body: '', image: '', imageAlt: '', bg: '', text: '', format: 'card', button: { label: '', url: '', color: '' }, hideOnMobile: false, hideOnDesktop: false },
  code: { html: '' },
};

export function newSection(type) {
  return { id: `${type}_${Date.now().toString(36)}`, type, enabled: true, ...EMPTY_BY_TYPE[type] };
}
