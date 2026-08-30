// Shared color palette for CMS page/landing-page sections — deliberately NOT
// a free color picker. Every swatch is derived from the site's theme
// (Settings → Theme), so a section can never end up off-brand, and every
// swatch updates automatically if the theme's primary/accent colors change.
export const SECTION_SWATCHES = [
  { key: '', label: 'Theme default (no override)' },
  { key: 'primary', label: 'Primary (navy)', bg: 'var(--primary)', dark: true },
  { key: 'primary-dark', label: 'Primary Dark (deep navy)', bg: 'var(--primary-dark)', dark: true },
  { key: 'accent', label: 'Accent (gold)', bg: 'var(--accent)', dark: false },
  { key: 'tint', label: 'Light Tint', bg: 'var(--primary-50)', dark: false },
  { key: 'white', label: 'White', bg: '#ffffff', dark: false },
];

export function swatchBg(key) {
  const s = SECTION_SWATCHES.find((x) => x.key === key);
  return s?.bg; // undefined for '' (theme default) — caller omits the style entirely
}

export function swatchIsDark(key) {
  return !!SECTION_SWATCHES.find((x) => x.key === key)?.dark;
}

// text override: '' = auto (contrast against bg), 'light' = force white,
// 'dark' = force near-black — always overridable regardless of the auto pick.
export function resolveTextColor(bgKey, textOverride) {
  if (textOverride === 'light') return '#ffffff';
  if (textOverride === 'dark') return 'var(--ink)';
  return swatchIsDark(bgKey) ? '#ffffff' : 'var(--ink)';
}

// Buttons need a real color even when the section itself has no bg
// override, so '' resolves to the theme primary rather than "no style".
export function resolveButtonBg(key) {
  return swatchBg(key) || 'var(--primary)';
}
