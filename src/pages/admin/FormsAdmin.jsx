import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

export default function FormsAdmin() {
  const { forms, addForm, removeForm, moveToTrash, restoreFromTrash } = useData();
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const onDelete = async (f) => {
    const ok = await confirmDialog({ title: 'Delete form?', message: `Delete form "${f.name}"? Any page using it will fall back to a plain contact link. It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeForm(f.id);
    const entry = moveToTrash('forms', f);
    notifyUndo(`Deleted "${f.name}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  const onDuplicate = (f) => {
    const { id, ...rest } = f;
    addForm({ ...rest, name: `${f.name} (Copy)` });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Enquiry Forms</h1>
        <Link className="a-btn a-btn-primary" to="/admin/forms/new">+ Add Form</Link>
      </div>
      <div className="a-card">
        <p style={{ fontSize: '0.86rem', color: 'var(--a-muted)' }}>
          Every form always collects <b>Name</b> and <b>Phone</b> — add whatever extra questions you need on top. Assign a form to a
          project, page or the main Contact page from that item's editor.
        </p>
      </div>
      {forms.length === 0 ? (
        <div className="a-empty">No forms yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th>Name</th><th>Extra Fields</th><th>CRM Endpoint</th><th></th></tr></thead>
          <tbody>
            {forms.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.fields?.length || 0}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--a-muted)' }}>{f.crmApiUrl || 'Site default'}</td>
                <td className="actions">
                  <Link className="a-btn a-btn-ghost a-btn-sm" to={`/admin/forms/${f.id}`}>Edit</Link>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => onDuplicate(f)}>Duplicate</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onDelete(f)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
