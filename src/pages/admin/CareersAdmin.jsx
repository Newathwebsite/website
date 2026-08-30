import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AdminForm from '../../components/admin/AdminForm';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

const EMPTY = { title: '', department: '', location: '', type: 'Full-time', description: '', formId: '' };
const FIELDS = [
  { name: 'title', label: 'Job Title', required: true },
  { name: 'department', label: 'Department', placeholder: 'Sales' },
  { name: 'location', label: 'Location', placeholder: 'Chennai' },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }] },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function CareersAdmin() {
  const { jobOpenings, addJobOpening, updateJobOpening, removeJobOpening, forms, moveToTrash, restoreFromTrash } = useData();
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const startNew = () => { setEditingId(null); setValues(EMPTY); setShowForm(true); };
  const startEdit = (j) => { setEditingId(j.id); setValues(j); setShowForm(true); };
  const onSubmit = (data) => {
    if (editingId) updateJobOpening(editingId, data);
    else addJobOpening(data);
    setShowForm(false);
  };
  const onDelete = async (j) => {
    const ok = await confirmDialog({ title: 'Delete job opening?', message: `Delete "${j.title}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeJobOpening(j.id);
    const entry = moveToTrash('careers', j);
    notifyUndo(`Deleted "${j.title}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };
  const onDuplicate = (j) => {
    const { id, ...rest } = j;
    addJobOpening({ ...rest, title: `${j.title} (Copy)` });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Job Openings</h1>
        {!showForm && <button className="a-btn a-btn-primary" onClick={startNew}>+ Add Job Opening</button>}
      </div>

      {showForm && (
        <div className="a-card">
          <AdminForm fields={FIELDS} values={values} onChange={setValues} onSubmit={onSubmit} submitLabel={editingId ? 'Save Changes' : 'Add Job Opening'} onCancel={() => setShowForm(false)} />
          <div className="a-fld" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--a-border)' }}>
            <label>Application Form</label>
            <select value={values.formId || ''} onChange={(e) => setValues((v) => ({ ...v, formId: e.target.value }))}>
              <option value="">No inline form (Apply just links to Contact)</option>
              {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <div className="hint">When set, "Apply" opens this form inline instead of linking out. Manage forms under Enquiry Forms.</div>
            <button type="button" className="a-btn a-btn-primary a-btn-sm" style={{ marginTop: 10 }} onClick={() => onSubmit(values)}>{editingId ? 'Save Changes' : 'Add Job Opening'}</button>
          </div>
        </div>
      )}

      {jobOpenings.length === 0 ? (
        <div className="a-empty">No job openings yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th>Title</th><th>Department</th><th>Location</th><th>Type</th><th>Form</th><th></th></tr></thead>
          <tbody>
            {jobOpenings.map((j) => (
              <tr key={j.id}>
                <td>{j.title}</td>
                <td>{j.department}</td>
                <td>{j.location}</td>
                <td>{j.type}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--a-muted)' }}>{forms.find((f) => f.id === j.formId)?.name || '—'}</td>
                <td className="actions">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEdit(j)}>Edit</button>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => onDuplicate(j)}>Duplicate</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onDelete(j)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
