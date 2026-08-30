import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AdminForm, { useDragReorder } from '../../components/admin/AdminForm';
import { useConfirm } from '../../components/admin/ConfirmProvider';
import { SECTION_TYPES, newSection } from '../../lib/homeSections';

const HERO_FIELDS = [
  { name: 'eyebrow', label: 'Eyebrow (small text above the heading)' },
  { name: 'headingLine1', label: 'Heading — first line' },
  { name: 'headingAccent', label: 'Heading — highlighted word (accent color)' },
  { name: 'headingScript', label: 'Heading — script word (italic accent font)' },
  { name: 'subheading', label: 'Subheading', type: 'textarea' },
  { name: 'tag', label: 'Small quote/tag line' },
  { name: 'primaryCtaLabel', label: 'Primary Button Label' },
  { name: 'primaryCtaUrl', label: 'Primary Button Link', placeholder: '/contact' },
  { name: 'secondaryCtaLabel', label: 'Secondary Button Label' },
  { name: 'secondaryCtaUrl', label: 'Secondary Button Link', placeholder: '/villas' },
  { name: 'image', label: 'Hero Image', type: 'image', altField: 'imageAlt' },
];

const CARD_STYLE_OPTIONS = [
  { value: 'classic', label: 'Classic (swipe/fan deck)' },
  { value: 'flip', label: 'Rich Flip Cards (grid)' },
  { value: 'premium', label: 'Premium Wide (grid)' },
];

function StatsFields({ section, onChange }) {
  const items = section.items || [];
  const update = (i, key, val) => onChange({ ...section, items: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
  const remove = (i) => onChange({ ...section, items: items.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...section, items: [...items, { value: '', label: '' }] });
  return (
    <>
      {items.map((it, i) => (
        <div className="a-repeat-row" key={i}>
          <div className="a-fld"><input placeholder="Value, e.g. 20+ or CREDAI" value={it.value} onChange={(e) => update(i, 'value', e.target.value)} /></div>
          <div className="a-fld"><input placeholder="Label, e.g. Years of Expertise" value={it.label} onChange={(e) => update(i, 'label', e.target.value)} /></div>
          <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add Stat</button>
      <div className="hint">A value starting with digits (e.g. "20+") counts up on scroll; plain text (e.g. "CREDAI") just displays as-is.</div>
    </>
  );
}

function PrecisionFields({ section, onChange }) {
  const items = section.items || [];
  const update = (i, key, val) => onChange({ ...section, items: items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) });
  const remove = (i) => onChange({ ...section, items: items.filter((_, idx) => idx !== i) });
  const add = () => onChange({ ...section, items: [...items, { title: '', body: '' }] });
  return (
    <>
      <div className="a-fld"><label>Kicker</label><input value={section.kicker || ''} onChange={(e) => onChange({ ...section, kicker: e.target.value })} /></div>
      <div className="a-fld"><label>Heading</label><input value={section.heading || ''} onChange={(e) => onChange({ ...section, heading: e.target.value })} /></div>
      <div className="a-fld"><label>Body</label><textarea value={section.body || ''} onChange={(e) => onChange({ ...section, body: e.target.value })} /></div>
      {items.map((it, i) => (
        <div className="a-repeat-row" key={i}>
          <div className="a-fld"><input placeholder="Title" value={it.title} onChange={(e) => update(i, 'title', e.target.value)} /></div>
          <div className="a-fld"><input placeholder="Body" value={it.body} onChange={(e) => update(i, 'body', e.target.value)} /></div>
          <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add Item</button>
    </>
  );
}

function SectionEditor({ section, onChange }) {
  const s = section;
  const set = (patch) => onChange({ ...s, ...patch });

  if (s.type === 'banner') {
    return (
      <>
        <div className="a-fld"><label>Kicker</label><input value={s.kicker || ''} onChange={(e) => set({ kicker: e.target.value })} /></div>
        <div className="a-fld"><label>Heading</label><input value={s.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></div>
        <div className="hint">The banner cards themselves (size, auto-scroll speed) are set under Settings → Banner, and always show your real published projects.</div>
      </>
    );
  }
  if (s.type === 'stats') return <StatsFields section={s} onChange={onChange} />;
  if (s.type === 'featured') {
    return (
      <>
        <div className="a-fld"><label>Kicker</label><input value={s.kicker || ''} onChange={(e) => set({ kicker: e.target.value })} /></div>
        <div className="a-fld"><label>Heading</label><input value={s.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></div>
        <div className="a-fld"><label>Body</label><textarea value={s.body || ''} onChange={(e) => set({ body: e.target.value })} /></div>
        <div className="a-repeat-row">
          <div className="a-fld">
            <label>Card Style — Desktop</label>
            <select value={s.cardStyleDesktop || 'classic'} onChange={(e) => set({ cardStyleDesktop: e.target.value })}>
              {CARD_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="a-fld">
            <label>Card Style — Mobile</label>
            <select value={s.cardStyleMobile || 'classic'} onChange={(e) => set({ cardStyleMobile: e.target.value })}>
              {CARD_STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="hint">"Classic" keeps the swipeable/fanned deck; the other two styles show a plain grid instead, matching Villas/Apartments.</div>
      </>
    );
  }
  if (s.type === 'precision') return <PrecisionFields section={s} onChange={onChange} />;
  if (s.type === 'code') {
    return (
      <div className="a-fld">
        <label>Custom HTML</label>
        <textarea
          value={s.html || ''}
          onChange={(e) => set({ html: e.target.value })}
          placeholder="<div>Paste any HTML/embed code here…</div>"
          rows={10}
          style={{ fontFamily: 'monospace', fontSize: '.82rem' }}
        />
        <div className="hint">Rendered exactly as-is, full width — for embeds or one-off layouts the section types above don't cover.</div>
      </div>
    );
  }
  if (s.type === 'cta') {
    return (
      <>
        <div className="a-fld"><label>Heading</label><input value={s.heading || ''} onChange={(e) => set({ heading: e.target.value })} /></div>
        <div className="a-fld"><label>Body</label><textarea value={s.body || ''} onChange={(e) => set({ body: e.target.value })} /></div>
        <div className="a-repeat-row">
          <div className="a-fld"><input placeholder="Button label" value={s.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></div>
          <div className="a-fld"><input placeholder="Button link" value={s.ctaUrl || ''} onChange={(e) => set({ ctaUrl: e.target.value })} /></div>
        </div>
      </>
    );
  }
  // generic — reuse the same sectionlist single-item shape as other pages
  return (
    <AdminForm
      fields={[{ name: 'sections', label: '', type: 'sectionlist' }]}
      values={{ sections: [s] }}
      onChange={(v) => onChange({ ...v.sections[0], id: s.id, type: 'generic' })}
      onSubmit={() => {}}
      submitLabel=""
    />
  );
}

export default function HomePageAdmin() {
  const { settings, updateSettings } = useData();
  const [values, setValues] = useState(settings.homePage);
  const [saved, setSaved] = useState(false);
  const [addType, setAddType] = useState('generic');
  const confirmDialog = useConfirm();

  const save = (patch) => {
    const merged = { ...values, ...patch };
    setValues(merged);
    updateSettings({ homePage: merged });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const updateSection = (id, patch) => save({ sections: values.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const removeSection = async (id) => {
    const ok = await confirmDialog({ title: 'Remove section?', message: 'This removes the section from the home page. You can add a new one back, but its content will not be restored.', confirmLabel: 'Remove', danger: true });
    if (ok) save({ sections: values.sections.filter((s) => s.id !== id) });
  };
  const duplicateSection = (i) => {
    const src = values.sections[i];
    const clone = { ...src, id: `${src.type}_${Date.now().toString(36)}` };
    const next = [...values.sections];
    next.splice(i + 1, 0, clone);
    save({ sections: next });
  };
  const moveSection = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= values.sections.length) return;
    const next = [...values.sections];
    [next[i], next[j]] = [next[j], next[i]];
    save({ sections: next });
  };
  const addSection = () => {
    save({ sections: [...values.sections, newSection(addType)] });
  };
  const { handleProps, dropTargetProps } = useDragReorder(values.sections, (next) => save({ sections: next }));

  return (
    <>
      <div className="a-topbar">
        <h1>Home Page</h1>
        <a className="a-btn a-btn-ghost" href="/" target="_blank" rel="noreferrer">Preview Live Site</a>
      </div>
      {saved && <div className="a-msg ok">Saved.</div>}

      <div className="a-card">
        <h3 style={{ marginBottom: 14 }}>Hero</h3>
        <AdminForm fields={HERO_FIELDS} values={values.hero} onChange={(v) => setValues((s) => ({ ...s, hero: v }))} onSubmit={(v) => save({ hero: v })} submitLabel="Save Hero" />
      </div>

      <div className="a-card">
        <h3 style={{ marginBottom: 6 }}>Scrolling Marquee</h3>
        <p className="hint" style={{ marginBottom: 12 }}>The strip of phrases scrolling beneath the hero.</p>
        <textarea
          value={(values.marqueePhrases || []).join(', ')}
          onChange={(e) => setValues((s) => ({ ...s, marqueePhrases: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
          onBlur={() => save({ marqueePhrases: values.marqueePhrases })}
        />
        <div className="hint">Comma-separated.</div>
      </div>

      <div className="a-card">
        <h3 style={{ marginBottom: 6 }}>Sections</h3>
        <p className="hint" style={{ marginBottom: 16 }}>Reorder, hide, or edit each block of the home page. The banner and featured-projects sections always pull your real published projects — only their heading/style is editable here.</p>

        {values.sections.map((s, i) => (
          <div className="a-card" key={s.id} style={{ padding: 16, marginBottom: 14, opacity: s.enabled === false ? 0.55 : 1 }} {...dropTargetProps(i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="a-drag-handle" title="Drag to reorder" {...handleProps(i)}>⠿ Drag</span>
                <div style={{ fontWeight: 700 }}>{SECTION_TYPES.find((t) => t.type === s.type)?.label || s.type}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === 0} onClick={() => moveSection(i, -1)}>↑</button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === values.sections.length - 1} onClick={() => moveSection(i, 1)}>↓</button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => updateSection(s.id, { enabled: s.enabled === false })}>{s.enabled === false ? 'Show' : 'Hide'}</button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => duplicateSection(i)}>Duplicate</button>
                <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => removeSection(s.id)}>Remove</button>
              </div>
            </div>
            <SectionEditor section={s} onChange={(next) => updateSection(s.id, next)} />
          </div>
        ))}

        <div className="a-repeat-row">
          <div className="a-fld">
            <select value={addType} onChange={(e) => setAddType(e.target.value)}>
              {SECTION_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
          </div>
          <button type="button" className="a-btn a-btn-primary a-btn-sm" onClick={addSection}>+ Add Section</button>
        </div>
      </div>
    </>
  );
}
