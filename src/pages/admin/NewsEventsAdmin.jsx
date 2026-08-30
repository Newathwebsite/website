import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

const EMPTY = { title: '', date: '', excerpt: '', image: '', imageAlt: '', content: '', metaTitle: '', metaDescription: '' };
const FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'date', label: 'Date', placeholder: 'YYYY-MM-DD' },
  { name: 'image', label: 'Image', type: 'image', altField: 'imageAlt' },
  { name: 'excerpt', label: 'Short Excerpt', type: 'textarea', seo: 'description' },
  { name: 'content', label: 'Full Content', type: 'textarea' },
];

export default function NewsEventsAdmin() {
  const { newsEvents, addNewsEvent, updateNewsEvent, removeNewsEvent, moveToTrash, restoreFromTrash } = useData();
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const startNew = () => { setEditingId(null); setValues(EMPTY); setShowForm(true); };
  const startEdit = (n) => { setEditingId(n.id); setValues(n); setShowForm(true); };
  const onSubmit = (data) => {
    if (editingId) updateNewsEvent(editingId, data);
    else addNewsEvent(data);
    setShowForm(false);
  };
  const onDelete = async (n) => {
    const ok = await confirmDialog({ title: 'Delete update?', message: `Delete "${n.title}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeNewsEvent(n.id);
    const entry = moveToTrash('newsEvents', n);
    notifyUndo(`Deleted "${n.title}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };
  const onDuplicate = (n) => {
    const { id, ...rest } = n;
    addNewsEvent({ ...rest, title: `${n.title} (Copy)` });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>News &amp; Events</h1>
        {!showForm && <button className="a-btn a-btn-primary" onClick={startNew}>+ Add Update</button>}
      </div>

      {showForm && (
        <div className="a-card">
          <AdminForm fields={FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={editingId ? 'Save Changes' : 'Add Update'} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {newsEvents.length === 0 ? (
        <div className="a-empty">No news or events yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th></th><th>Title</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {newsEvents.map((n) => (
              <tr key={n.id}>
                <td>{n.image && <img className="thumb" src={n.image} alt="" />}</td>
                <td>{n.title}</td>
                <td>{n.date}</td>
                <td className="actions">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEdit(n)}>Edit</button>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => onDuplicate(n)}>Duplicate</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onDelete(n)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
