import { useRef } from 'react';
import ImageField from './ImageField';
import SeoHint from './SeoHint';
import AiAssistButton from './AiAssistButton';
import { SECTION_SWATCHES } from '../../lib/sectionSwatches';

// Native HTML5 drag-and-drop for reordering a list — no library needed.
// Only the drag-handle element itself is `draggable`, so dragging never
// hijacks clicks/text-selection inside the card's own inputs.
export function useDragReorder(items, onChange) {
  const dragIndex = useRef(null);
  return {
    handleProps: (i) => ({
      draggable: true,
      onDragStart: (e) => { dragIndex.current = i; e.dataTransfer.effectAllowed = 'move'; },
    }),
    dropTargetProps: (i) => ({
      onDragOver: (e) => e.preventDefault(),
      onDrop: (e) => {
        e.preventDefault();
        const from = dragIndex.current;
        dragIndex.current = null;
        if (from === null || from === i) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(i, 0, moved);
        onChange(next);
      },
    }),
  };
}

// Schema-driven form used by every admin CRUD screen (projects, testimonials,
// news/events, job openings, page sections). Keeps the CRUD screens tiny —
// they just pass a `fields` schema instead of hand-writing a form each time.
//
// Supported field types: text, textarea, number, select, boolean,
// stringlist (comma-separated -> array of strings), faqlist (repeatable Q/A),
// image (upload/library/URL + optional alt via altField), video (URL-only,
// clearly labeled — no file upload, since video files are too large for
// localStorage).

function StringListField({ field, value, onChange }) {
  const text = (value || []).join(', ');
  return (
    <div className="a-fld">
      <label>{field.label}</label>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        placeholder={field.placeholder}
      />
      {field.hint && <div className="hint">{field.hint}</div>}
    </div>
  );
}

function FaqListField({ field, value, onChange }) {
  const items = value && value.length ? value : [];

  const update = (i, key, val) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { q: '', a: '' }]);

  return (
    <div className="a-fld">
      <label>{field.label}</label>
      {items.map((it, i) => (
        <div className="a-repeat-row" key={i}>
          <div className="a-fld">
            <input placeholder="Question" value={it.q} onChange={(e) => update(i, 'q', e.target.value)} />
          </div>
          <div className="a-fld">
            <input placeholder="Answer" value={it.a} onChange={(e) => update(i, 'a', e.target.value)} />
          </div>
          <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add FAQ</button>
    </div>
  );
}

function SectionListField({ field, value, onChange }) {
  const items = value && value.length ? value : [];
  const { handleProps, dropTargetProps } = useDragReorder(items, onChange);

  const update = (i, key, val) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, {
    heading: '', body: '', image: '', imageAlt: '', imageMobile: '',
    bg: '', text: '', format: 'card',
    button: { label: '', url: '', color: '' },
    hideOnMobile: false, hideOnDesktop: false,
  }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const updateButton = (i, key, val) => {
    const btn = { label: '', url: '', color: '', ...(items[i].button || {}) };
    update(i, 'button', { ...btn, [key]: val });
  };

  return (
    <div className="a-fld">
      <label>{field.label}</label>
      {field.hint && <div className="hint" style={{ marginBottom: 8 }}>{field.hint}</div>}
      {items.map((it, i) => {
        const btn = it.button || { label: '', url: '', color: '' };
        const isHtml = it.format === 'html';
        return (
        <div className="a-card" key={i} style={{ padding: 14, marginBottom: 10 }} {...dropTargetProps(i)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="a-drag-handle" title="Drag to reorder" {...handleProps(i)}>⠿ Drag</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
            </div>
          </div>

          <div className="a-fld">
            <label>Layout Format</label>
            <select value={it.format || 'card'} onChange={(e) => update(i, 'format', e.target.value)}>
              <option value="card">Card (grid, with the other sections)</option>
              <option value="image-left">Image left, text right (full width)</option>
              <option value="image-right">Image right, text left (full width)</option>
              <option value="banner">Full-width banner (centered text)</option>
              <option value="html">Custom Code (paste your own HTML)</option>
            </select>
          </div>

          {isHtml ? (
            <div className="a-fld">
              <label>Custom HTML</label>
              <textarea
                value={it.html || ''}
                onChange={(e) => update(i, 'html', e.target.value)}
                placeholder="<div>Paste any HTML/embed code here…</div>"
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: '.82rem' }}
              />
              <div className="hint">Rendered exactly as-is on the page — full width, no theme styling applied. Use this for embeds, widgets or one-off layouts the section builder above doesn't cover.</div>
            </div>
          ) : (
            <>
              <div className="a-fld">
                <label>Heading</label>
                <input value={it.heading} onChange={(e) => update(i, 'heading', e.target.value)} />
              </div>
              <div className="a-fld">
                <label>Body</label>
                <textarea value={it.body} onChange={(e) => update(i, 'body', e.target.value)} />
              </div>
              <ImageField
                field={{ label: 'Image — desktop (optional — a generic icon shows when left blank)' }}
                value={it.image}
                onChange={(v) => update(i, 'image', v)}
                altValue={it.imageAlt}
                onAltChange={(v) => update(i, 'imageAlt', v)}
              />
              <ImageField
                field={{ label: 'Image — mobile override (optional, falls back to the desktop image above)' }}
                value={it.imageMobile}
                onChange={(v) => update(i, 'imageMobile', v)}
              />
              <div className="a-repeat-row">
                <div className="a-fld">
                  <label>Background</label>
                  <select value={it.bg || ''} onChange={(e) => update(i, 'bg', e.target.value)}>
                    {SECTION_SWATCHES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="a-fld">
                  <label>Text Color</label>
                  <select value={it.text || ''} onChange={(e) => update(i, 'text', e.target.value)}>
                    <option value="">Auto (matches background)</option>
                    <option value="light">Force light text</option>
                    <option value="dark">Force dark text</option>
                  </select>
                </div>
              </div>
              <div className="hint" style={{ marginBottom: 12 }}>Colors are limited to the site theme (Settings → Theme) so sections always stay on-brand. Text defaults to auto-contrast against the background, but can be forced either way.</div>

              <div className="a-fld">
                <label>Button (optional)</label>
              </div>
              <div className="a-repeat-row">
                <div className="a-fld"><input placeholder="Button label, e.g. Book a Visit" value={btn.label} onChange={(e) => updateButton(i, 'label', e.target.value)} /></div>
                <div className="a-fld"><input placeholder="Link, e.g. /contact" value={btn.url} onChange={(e) => updateButton(i, 'url', e.target.value)} /></div>
                <div className="a-fld">
                  <select value={btn.color || ''} onChange={(e) => updateButton(i, 'color', e.target.value)}>
                    {SECTION_SWATCHES.filter((s) => s.key !== '').map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="a-repeat-row" style={{ marginTop: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem' }}>
              <input type="checkbox" checked={!!it.hideOnMobile} onChange={(e) => update(i, 'hideOnMobile', e.target.checked)} /> Hide this section on mobile
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem' }}>
              <input type="checkbox" checked={!!it.hideOnDesktop} onChange={(e) => update(i, 'hideOnDesktop', e.target.checked)} /> Hide this section on desktop
            </label>
          </div>

          <button type="button" className="a-btn a-btn-danger a-btn-sm" style={{ marginTop: 14 }} onClick={() => remove(i)}>Remove Section</button>
        </div>
        );
      })}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add Section</button>
    </div>
  );
}

function ImageListField({ field, value, onChange }) {
  const items = value || [];
  const update = (i, url) => onChange(items.map((u, idx) => (idx === i ? url : u)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="a-fld">
      <label>{field.label}</label>
      {field.hint && <div className="hint" style={{ marginBottom: 8 }}>{field.hint}</div>}
      {items.map((url, i) => (
        <div key={i} className="a-card" style={{ padding: 12, marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <ImageField field={{ label: `Image ${i + 1}${i === 0 ? ' (also the preview thumbnail)' : ''}` }} value={url} onChange={(v) => update(i, v)} />
          </div>
          <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add Image</button>
    </div>
  );
}

function PairListField({ field, value, onChange, keys, placeholders }) {
  const items = value && value.length ? value : [];
  const [k1, k2] = keys;

  const update = (i, key, val) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { [k1]: '', [k2]: '' }]);

  return (
    <div className="a-fld">
      <label>{field.label}</label>
      {field.hint && <div className="hint" style={{ marginBottom: 8 }}>{field.hint}</div>}
      {items.map((it, i) => (
        <div className="a-repeat-row" key={i}>
          <div className="a-fld"><input placeholder={placeholders[0]} value={it[k1]} onChange={(e) => update(i, k1, e.target.value)} /></div>
          <div className="a-fld"><input placeholder={placeholders[1]} value={it[k2]} onChange={(e) => update(i, k2, e.target.value)} /></div>
          <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={add}>+ Add {field.addLabel || 'Row'}</button>
    </div>
  );
}

export default function AdminForm({ fields, values, onChange, onSubmit, submitLabel = 'Save', onCancel }) {
  const set = (name, val) => onChange({ ...values, [name]: val });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      {fields.map((f) => {
        const val = values[f.name];

        if (f.type === 'stringlist') {
          return <StringListField key={f.name} field={f} value={val} onChange={(v) => set(f.name, v)} />;
        }
        if (f.type === 'faqlist') {
          return <FaqListField key={f.name} field={f} value={val} onChange={(v) => set(f.name, v)} />;
        }
        if (f.type === 'sectionlist') {
          return <SectionListField key={f.name} field={f} value={val} onChange={(v) => set(f.name, v)} />;
        }
        if (f.type === 'imagelist') {
          return <ImageListField key={f.name} field={f} value={val} onChange={(v) => set(f.name, v)} />;
        }
        if (f.type === 'image') {
          return (
            <ImageField
              key={f.name}
              field={f}
              value={val}
              onChange={(v) => set(f.name, v)}
              altValue={f.altField ? values[f.altField] : undefined}
              onAltChange={f.altField ? (v) => set(f.altField, v) : undefined}
            />
          );
        }
        if (f.type === 'statlist') {
          return <PairListField key={f.name} field={f} value={val} onChange={(v) => set(f.name, v)} keys={['v', 'l']} placeholders={['Value, e.g. 15', 'Label, e.g. Villas']} />;
        }
        if (f.type === 'nearbylist') {
          return <PairListField key={f.name} field={f} value={val} onChange={(v) => set(f.name, v)} keys={['n', 't']} placeholders={['Place name', 'Travel time, e.g. 5 mins']} />;
        }
        if (f.type === 'video') {
          return (
            <div className="a-fld" key={f.name}>
              <label>{f.label}</label>
              <input type="text" value={val || ''} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder || 'https://youtube.com/watch?v=… or a direct .mp4 URL'} />
              <div className="hint">{f.hint || 'Paste a YouTube/Vimeo/direct video link — video files are not uploaded here, only linked by URL.'}</div>
            </div>
          );
        }
        if (f.type === 'textarea') {
          return (
            <div className="a-fld" key={f.name}>
              <label>{f.label}</label>
              {f.ai && <AiAssistButton kind={f.ai.kind} label={f.ai.label} placeholder={f.ai.placeholder} context={typeof f.ai.context === 'function' ? f.ai.context(values) : f.ai.context} onResult={(text) => set(f.name, text)} />}
              <textarea value={val || ''} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} required={f.required} />
              {f.seo && <SeoHint kind={f.seo} value={val} />}
              {f.hint && <div className="hint">{f.hint}</div>}
            </div>
          );
        }
        if (f.type === 'select') {
          return (
            <div className="a-fld" key={f.name}>
              <label>{f.label}</label>
              <select value={val || f.options[0]?.value} onChange={(e) => set(f.name, e.target.value)}>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          );
        }
        if (f.type === 'boolean') {
          return (
            <div className="a-fld" key={f.name}>
              <label>
                <input type="checkbox" checked={!!val} onChange={(e) => set(f.name, e.target.checked)} style={{ width: 'auto', marginRight: 8 }} />
                {f.label}
              </label>
            </div>
          );
        }
        return (
          <div className="a-fld" key={f.name}>
            <label>{f.label}</label>
            {f.ai && <AiAssistButton kind={f.ai.kind} label={f.ai.label} placeholder={f.ai.placeholder} context={typeof f.ai.context === 'function' ? f.ai.context(values) : f.ai.context} onResult={(text) => set(f.name, text)} />}
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={val ?? ''}
              onChange={(e) => set(f.name, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
            />
            {f.seo && <SeoHint kind={f.seo} value={val} />}
            {f.hint && <div className="hint">{f.hint}</div>}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="submit" className="a-btn a-btn-primary">{submitLabel}</button>
        {onCancel && <button type="button" className="a-btn a-btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
