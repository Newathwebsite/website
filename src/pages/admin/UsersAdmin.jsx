import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PERMISSION_RESOURCES } from '../../data/seedData';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

const EMPTY = { username: '', password: '', role: 'Editor', permissions: Object.fromEntries(PERMISSION_RESOURCES.map((r) => [r, { view: true, edit: false }])) };

const RESOURCE_LABELS = {
  projects: 'Projects', pages: 'Pages', homePage: 'Home Page', landingPages: 'Landing Pages', blog: 'Blog', testimonials: 'Testimonials',
  newsEvents: 'News & Events', careers: 'Job Openings', forms: 'Enquiry Forms', media: 'Media Library', push: 'Push Notifications', settings: 'Settings', users: 'Users',
};

export default function UsersAdmin() {
  const { users, addUser, updateUser, removeUser, moveToTrash, restoreFromTrash } = useData();
  const { currentUser, can } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const canEdit = can('users', 'edit');

  const startNew = () => { setEditingId(null); setValues(EMPTY); setShowForm(true); };
  const startEdit = (u) => { setEditingId(u.id); setValues(u); setShowForm(true); };

  const togglePerm = (resource, action) => {
    setValues((v) => ({
      ...v,
      permissions: {
        ...v.permissions,
        [resource]: { ...v.permissions[resource], [action]: !v.permissions[resource]?.[action] },
      },
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateUser(editingId, values);
    else addUser(values);
    setShowForm(false);
  };

  const onDelete = async (u) => {
    if (u.id === currentUser?.id) { alert("You can't delete the account you're currently logged in as."); return; }
    const ok = await confirmDialog({ title: 'Delete user?', message: `Delete user "${u.username}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeUser(u.id);
    const entry = moveToTrash('users', u);
    notifyUndo(`Deleted "${u.username}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  const onDuplicate = (u) => {
    const { id, ...rest } = u;
    addUser({ ...rest, username: `${u.username}-copy` });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Users</h1>
        {canEdit && !showForm && <button className="a-btn a-btn-primary" onClick={startNew}>+ Add User</button>}
      </div>

      {showForm && (
        <div className="a-card">
          <form onSubmit={onSubmit}>
            <div className="a-fld-row">
              <div className="a-fld">
                <label>Username</label>
                <input value={values.username} onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))} required />
              </div>
              <div className="a-fld">
                <label>Password</label>
                <input type="text" value={values.password} onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))} required />
              </div>
            </div>
            <div className="a-fld">
              <label>Role Label</label>
              <input value={values.role} onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))} placeholder="e.g. Editor, Marketing, Sales" />
            </div>

            <div className="a-fld">
              <label>Permissions</label>
              <table className="a-table">
                <thead><tr><th>Section</th><th>View</th><th>Edit</th></tr></thead>
                <tbody>
                  {PERMISSION_RESOURCES.map((r) => (
                    <tr key={r}>
                      <td>{RESOURCE_LABELS[r]}</td>
                      <td><input type="checkbox" checked={!!values.permissions[r]?.view} onChange={() => togglePerm(r, 'view')} /></td>
                      <td><input type="checkbox" checked={!!values.permissions[r]?.edit} onChange={() => togglePerm(r, 'edit')} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="a-btn a-btn-primary">{editingId ? 'Save Changes' : 'Add User'}</button>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="a-table">
        <thead><tr><th>Username</th><th>Role</th><th>Access</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}{u.id === currentUser?.id && <span className="a-badge ok" style={{ marginLeft: 8 }}>You</span>}</td>
              <td>{u.role}</td>
              <td style={{ fontSize: '0.78rem', color: 'var(--a-muted)' }}>
                {PERMISSION_RESOURCES.filter((r) => u.permissions?.[r]?.edit).map((r) => RESOURCE_LABELS[r]).join(', ') || 'View only'}
              </td>
              <td className="actions">
                {canEdit && <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => startEdit(u)}>Edit</button>}
                {canEdit && <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => onDuplicate(u)}>Duplicate</button>}
                {canEdit && <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onDelete(u)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
