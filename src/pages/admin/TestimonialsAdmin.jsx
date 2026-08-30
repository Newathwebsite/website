import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

const EMPTY = { name: '', project: '', videoId: '', quote: '', rating: 5 };
const FIELDS = [
  { name: 'name', label: 'Label', placeholder: 'Homeowner Testimonial 1', hint: 'Shown under the video thumbnail. The real site does not attach homeowner names to these videos.' },
  { name: 'videoId', label: 'YouTube Video ID', required: true, placeholder: 'gmjt2bn7rsM', hint: 'The part after v= in the YouTube URL. Used for the thumbnail and the play modal.' },
  { name: 'project', label: 'Project (optional)', placeholder: 'ATH Feathers' },
  { name: 'quote', label: 'Written Quote (optional)', type: 'textarea' },
  { name: 'rating', label: 'Rating (1-5, optional)', type: 'number' },
];

export default function TestimonialsAdmin() {
  const { testimonials, addTestimonial, updateTestimonial, removeTestimonial, moveToTrash, restoreFromTrash } = useData();
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const startNew = () => { setEditingId(null); setValues(EMPTY); setShowForm(true); };
  const startEdit = (t) => { setEditingId(t.id); setValues(t); setShowForm(true); };
  const onSubmit = (data) => {
    if (editingId) updateTestimonial(editingId, data);
    else addTestimonial(data);
    setShowForm(false);
  };
  const onDelete = async (t) => {
    const ok = await confirmDialog({ title: 'Delete testimonial?', message: `Delete testimonial "${t.name || t.videoId}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeTestimonial(t.id);
    const entry = moveToTrash('testimonials', t);
    notifyUndo(`Deleted "${t.name || t.videoId}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };
  const onDuplicate = (t) => {
    const { id, ...rest } = t;
    addTestimonial({ ...rest, name: `${t.name || t.videoId} (Copy)` });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Testimonials</h1>
        {!showForm && <button className="a-btn a-btn-primary" onClick={startNew}>+ Add Testimonial</button>}
      </div>

      {showForm && (
        <div className="a-card">
          <AdminForm fields={FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={editingId ? 'Save Changes' : 'Add Testimonial'} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="a-empty">No testimonials yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th></th><th>Label</th><th>Video ID</th><th>Project</th><th></th></tr></thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id}>
                <td>{t.videoId && <img className="thumb" src={`https://img.youtube.com/vi/${t.videoId}/default.jpg`} alt="" />}</td>
                <td>{t.name}</td>
                <td>{t.videoId}</td>
                <td>{t.project}</td>
                <td className="actions">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEdit(t)}>Edit</button>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => onDuplicate(t)}>Duplicate</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onDelete(t)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
