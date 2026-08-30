import { swatchBg, resolveTextColor, resolveButtonBg } from '../../../lib/sectionSwatches';
import { sectionBoxStyle, sectionTextStyle, sectionAnimClass, hasCustomBg } from './sectionDesign';

// Generic renderer for a CMS page's `sections` array — every ath2 content
// page (About, Why ATH, NRI, Channel Partner, Careers, Testimonials,
// News & Events, Landing Pages) shows its content blocks through this
// single component instead of a hardcoded array of cards, so every section
// an admin adds/edits/removes/reorders/recolors in /admin actually appears
// on the page. A section with no image gets a plain numbered-bullet
// treatment instead of a broken/empty image slot.
//
// Each section can also carry:
// - `format` ('card' | 'image-left' | 'image-right' | 'banner' | 'html')
// - `bg`/`text` — theme-derived swatch keys (see lib/sectionSwatches.js),
//   used unless `style.bgType` opts into a custom background instead.
// - `button` — optional {label, url, color} CTA, color from the same swatches
// - `imageMobile` — optional distinct image for <760px, falls back to `image`
// - `hideOnMobile` / `hideOnDesktop` — per-device visibility
// - `html` — raw HTML, only used when format is 'html'
// - `style` — design overrides (see ./sectionDesign.js): spacing, align,
//   font, color, animation, bgType/bgColor/bgImage/bgVideo.
//
// Consecutive 'card' sections are grouped into one shared grid; any other
// format breaks out as its own full-width block, in the order authored.

function visibilityClass(s) {
  const cls = [];
  if (s.hideOnMobile) cls.push('hide-mobile');
  if (s.hideOnDesktop) cls.push('hide-desktop');
  return cls.join(' ');
}

function SectionImage({ s, className }) {
  if (!s.image && !s.imageMobile) return null;
  if (s.imageMobile && s.imageMobile !== s.image) {
    return (
      <>
        {s.image && <img className={`${className || ''} sec-img-desktop`} src={s.image} alt={s.imageAlt || s.heading || ''} />}
        <img className={`${className || ''} sec-img-mobile`} src={s.imageMobile} alt={s.imageAlt || s.heading || ''} />
      </>
    );
  }
  return <img className={className} src={s.image} alt={s.imageAlt || s.heading || ''} />;
}

function SectionButton({ s }) {
  const btn = s.button;
  if (!btn?.label) return null;
  const style = { background: resolveButtonBg(btn.color), color: btn.color === 'accent' || btn.color === 'tint' || btn.color === 'white' ? 'var(--ink)' : '#fff' };
  return <a className="sec-btn" href={btn.url || '#'} style={style}>{btn.label}</a>;
}

// Absolutely-positioned video layer for `style.bgType === 'video'` — sits
// behind the section's content (which needs its own position+z-index to
// paint above it; see CONTENT_Z_STYLE below) with a dark scrim for legible
// text, matching the .hero-photo pattern used elsewhere on the site.
function SectionBgVideo({ style }) {
  if (style?.bgType !== 'video' || !style.bgVideo) return null;
  return (
    <div className="sec-bg-video-wrap">
      <video className="sec-bg-video" src={style.bgVideo} autoPlay muted loop playsInline />
      <div className="sec-bg-video-overlay" />
    </div>
  );
}

const CONTENT_Z_STYLE = { position: 'relative', zIndex: 1 };

function CardTile({ s, i }) {
  const boxStyle = { position: 'relative', ...sectionBoxStyle(s.style) };
  const bg = swatchBg(s.bg);
  if (bg && !hasCustomBg(s.style)) boxStyle.background = bg;
  const textStyle = sectionTextStyle(s.style, resolveTextColor(s.bg, s.text));
  const animClass = sectionAnimClass(s.style);
  return (
    <div className={`card ${animClass} ${visibilityClass(s)}`} style={boxStyle}>
      <SectionBgVideo style={s.style} />
      <div style={CONTENT_Z_STYLE}>
        {s.image || s.imageMobile ? <SectionImage s={s} className="sec-tile-img" /> : <div className="ic">{i + 1}</div>}
        {s.heading && <h3 style={textStyle}>{s.heading}</h3>}
        {s.body && <p style={textStyle}>{s.body}</p>}
        <SectionButton s={s} />
      </div>
    </div>
  );
}

function CardGrid({ group, columns }) {
  return (
    <div className={`grid-${columns} rv`}>
      {group.map(({ s, i }) => <CardTile s={s} i={i} key={i} />)}
    </div>
  );
}

function SplitBlock({ s, i, reverse }) {
  const boxStyle = { position: 'relative', ...sectionBoxStyle(s.style) };
  const bg = swatchBg(s.bg);
  if (bg && !hasCustomBg(s.style)) boxStyle.background = bg;
  const textStyle = sectionTextStyle(s.style, resolveTextColor(s.bg, s.text));
  const animClass = sectionAnimClass(s.style);
  return (
    <div className={`sec-split ${animClass} rv ${visibilityClass(s)}`} style={{ ...boxStyle, flexDirection: reverse ? 'row-reverse' : 'row' }} key={i}>
      <SectionBgVideo style={s.style} />
      <div className="sec-split-media" style={CONTENT_Z_STYLE}>
        {s.image || s.imageMobile ? <SectionImage s={s} /> : <div className="ic" style={{ fontSize: '2rem' }}>{i + 1}</div>}
      </div>
      <div className="sec-split-copy" style={CONTENT_Z_STYLE}>
        {s.heading && <h3 style={textStyle}>{s.heading}</h3>}
        {s.body && <p style={textStyle}>{s.body}</p>}
        <SectionButton s={s} />
      </div>
    </div>
  );
}

function BannerBlock({ s, i }) {
  const boxStyle = { position: 'relative', ...sectionBoxStyle(s.style) };
  const bg = swatchBg(s.bg);
  if (bg && !hasCustomBg(s.style)) boxStyle.background = bg;
  const textStyle = sectionTextStyle(s.style, resolveTextColor(s.bg, s.text));
  const animClass = sectionAnimClass(s.style);
  return (
    <div className={`sec-banner ${animClass} rv ${visibilityClass(s)}`} style={boxStyle} key={i}>
      <SectionBgVideo style={s.style} />
      <div style={CONTENT_Z_STYLE}>
        <SectionImage s={s} />
        {s.heading && <h3 style={textStyle}>{s.heading}</h3>}
        {s.body && <p style={textStyle}>{s.body}</p>}
        <SectionButton s={s} />
      </div>
    </div>
  );
}

function CodeBlock({ s, i }) {
  return (
    <div className={`sec-html ${visibilityClass(s)}`} style={{ position: 'relative' }} key={i}>
      <div dangerouslySetInnerHTML={{ __html: s.html || '' }} />
    </div>
  );
}

export default function SectionCards({ sections, columns = 3 }) {
  const items = sections || [];

  if (!items.length) return null;

  const visible = items.map((s, i) => ({ s, i })).filter(({ s }) => !s.hideEverywhere);

  // Group consecutive 'card' (or unset) format sections; break out the rest.
  const groups = [];
  visible.forEach(({ s, i }) => {
    const format = s.format || 'card';
    if (format === 'card') {
      const last = groups[groups.length - 1];
      if (last && last.type === 'card') last.items.push({ s, i });
      else groups.push({ type: 'card', items: [{ s, i }] });
    } else {
      groups.push({ type: format, items: [{ s, i }] });
    }
  });

  return (
    <>
      {groups.map((g, gi) => {
        if (g.type === 'card') return <CardGrid group={g.items} columns={columns} key={gi} />;
        if (g.type === 'banner') return <BannerBlock s={g.items[0].s} i={g.items[0].i} key={gi} />;
        if (g.type === 'html') return <CodeBlock s={g.items[0].s} i={g.items[0].i} key={gi} />;
        return <SplitBlock s={g.items[0].s} i={g.items[0].i} reverse={g.type === 'image-right'} key={gi} />;
      })}
    </>
  );
}
