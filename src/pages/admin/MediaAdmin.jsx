import { useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import { uploadImage } from '../../lib/image';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

export default function MediaAdmin() {
  const { media, addMedia, updateMedia, removeMedia, moveToTrash, restoreFromTrash } = useData();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const onFile = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { url, width, height } = await uploadImage(file);
        addMedia({ name: file.name, url, width, height, alt: '' });
      }
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (m) => {
    const ok = await confirmDialog({ title: 'Delete image?', message: `Delete "${m.name}"? Anything still using this image will show a broken image. It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeMedia(m.id);
    const entry = moveToTrash('media', m);
    notifyUndo(`Deleted "${m.name}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Media Library</h1>
        <div>
          <button className="a-btn a-btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '⬆ Upload Images'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onFile} />
        </div>
      </div>

      <div className="a-card">
        <p style={{ fontSize: '0.86rem', color: 'var(--a-muted)' }}>
          Uploaded images are saved to the server and served from there — max upload size 8MB.
          Recommended resolution: <b>1600×900px</b> for desktop banners, <b>800×1000px</b> for mobile-first images.
        </p>
      </div>

      {media.length === 0 ? (
        <div className="a-empty">No images uploaded yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {media.map((m) => (
            <div className="a-card" key={m.id} style={{ padding: 12 }}>
              <img src={m.url} alt={m.alt || ''} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--a-muted)', marginBottom: 6, wordBreak: 'break-all' }}>{m.name}{m.width ? ` · ${m.width}×${m.height}px` : ''}</div>
              <input
                type="text"
                placeholder="Alt text"
                value={m.alt || ''}
                onChange={(e) => updateMedia(m.id, { alt: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', border: '1px solid var(--a-border)', borderRadius: 6, marginBottom: 8 }}
              />
              <button className="a-btn a-btn-danger a-btn-sm" style={{ width: '100%' }} onClick={() => onDelete(m)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
