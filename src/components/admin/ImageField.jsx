import { useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { uploadImage } from '../../lib/image';

// Image field with three ways to set a value — direct upload (saved to the
// server and added to the media library), pick an already-uploaded image,
// or paste a URL — plus an alt-text input and a responsive-resolution hint.
// Used wherever an admin form needs a real image field (project covers,
// page heroes, blog covers, popup image, logo).
export default function ImageField({ field, value, onChange, altValue, onAltChange }) {
  const { media, addMedia } = useData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url, width, height } = await uploadImage(file);
      const item = addMedia({ name: file.name, url, width, height, alt: altValue || '' });
      onChange(item.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="a-fld">
      <label>{field.label}</label>
      {value && (
        <div style={{ marginBottom: 10 }}>
          <img src={value} alt={altValue || ''} style={{ maxWidth: 220, maxHeight: 140, borderRadius: 8, border: '1px solid var(--a-border)', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : '⬆ Upload Image'}
        </button>
        <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setPickerOpen(true)}>🖼 Choose from Library</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      </div>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Or paste an image URL" />
      <div className="hint">
        {field.hint || 'Recommended resolution — Desktop: 1600×900px (16:9). Mobile: 800×1000px (4:5). Max upload size: 8MB.'}
      </div>

      {onAltChange && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, marginBottom: 6 }}>Alt text (for accessibility &amp; SEO)</label>
          <input type="text" value={altValue || ''} onChange={(e) => onAltChange(e.target.value)} placeholder="Describe the image" />
        </div>
      )}

      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,20,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPickerOpen(false)}>
          <div className="a-card" style={{ maxWidth: 640, width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="a-topbar"><h1 style={{ fontSize: '1.1rem' }}>Media Library</h1><button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setPickerOpen(false)}>Close</button></div>
            {media.length === 0 ? (
              <div className="a-empty">No uploads yet — upload an image first.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {media.map((m) => (
                  <button key={m.id} type="button" onClick={() => { onChange(m.url); if (onAltChange && m.alt) onAltChange(m.alt); setPickerOpen(false); }} style={{ padding: 0, border: '1px solid var(--a-border)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#fff' }}>
                    <img src={m.url} alt={m.alt || ''} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
