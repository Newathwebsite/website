// Elementor-style per-section design controls layered on top of the
// existing theme-swatch bg/text system (see lib/sectionSwatches.js), which
// stays as the default/on-brand option — `style.bgType` opts a section out
// into a raw custom color, an uploaded image, or a background video instead.
// Every field is optional; an empty `style` object renders exactly as
// before this feature existed.

export const SPACING_OPTIONS = [
  { key: '', label: 'Default' },
  { key: 'sm', label: 'Small', value: '16px' },
  { key: 'md', label: 'Medium', value: '32px' },
  { key: 'lg', label: 'Large', value: '56px' },
  { key: 'xl', label: 'Extra Large', value: '88px' },
];

export const ALIGN_OPTIONS = [
  { key: '', label: 'Default' },
  { key: 'left', label: 'Left' },
  { key: 'center', label: 'Center' },
  { key: 'right', label: 'Right' },
];

export const FONT_OPTIONS = [
  { key: '', label: 'Theme Default', family: '' },
  { key: 'sans', label: 'Poppins (Sans)', family: "'Poppins', sans-serif" },
  { key: 'display', label: 'Bebas Neue (Display)', family: "'Bebas Neue', sans-serif" },
  { key: 'dmsans', label: 'DM Sans', family: "'DM Sans', sans-serif" },
  { key: 'manrope', label: 'Manrope', family: "'Manrope', sans-serif" },
  { key: 'script', label: 'Yellowtail (Script)', family: "'Yellowtail', cursive" },
  { key: 'serif', label: 'Cormorant Garamond (Serif)', family: "'Cormorant Garamond', serif" },
];

export const ANIMATION_OPTIONS = [
  { key: '', label: 'None' },
  { key: 'fade-in', label: 'Fade In' },
  { key: 'fade-up', label: 'Fade Up' },
  { key: 'zoom-in', label: 'Zoom In' },
  { key: 'flip-in', label: 'Flip In' },
];

export const BG_TYPE_OPTIONS = [
  { key: '', label: 'Theme Swatch' },
  { key: 'color', label: 'Custom Color' },
  { key: 'image', label: 'Image' },
  { key: 'video', label: 'Video' },
];

function spacingValue(key) {
  return SPACING_OPTIONS.find((s) => s.key === key)?.value;
}

function fontFamily(key) {
  return FONT_OPTIONS.find((f) => f.key === key)?.family || undefined;
}

// Style for the section's outer box — padding + custom background (color or
// image; video is rendered separately as a layer, see SectionBgVideo below).
export function sectionBoxStyle(style) {
  const st = style || {};
  const out = {};
  const pad = spacingValue(st.spacing);
  if (pad) { out.paddingTop = pad; out.paddingBottom = pad; }
  if (st.bgType === 'color' && st.bgColor) out.background = st.bgColor;
  if (st.bgType === 'image' && st.bgImage) {
    out.backgroundImage = `url(${st.bgImage})`;
    out.backgroundSize = 'cover';
    out.backgroundPosition = 'center';
  }
  if (st.bgType === 'video' && st.bgVideo) out.position = 'relative';
  return out;
}

// Style for the text-bearing content within a section — alignment, font,
// and a raw color override (falls back to the swatch-contrast color passed
// in as `fallbackColor` when no custom color is set).
export function sectionTextStyle(style, fallbackColor) {
  const st = style || {};
  const out = { color: st.color || fallbackColor };
  if (st.align) out.textAlign = st.align;
  const family = fontFamily(st.font);
  if (family) out.fontFamily = family;
  return out;
}

export function sectionAnimClass(style) {
  const anim = style?.animation;
  return anim ? `card-anim-${anim}` : '';
}

export function hasCustomBg(style) {
  return style?.bgType === 'color' || style?.bgType === 'image' || style?.bgType === 'video';
}
