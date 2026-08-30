import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'villa', label: 'Villa' },
  { key: 'apartment', label: 'Apartment' },
];

export default function ProjectsAdmin() {
  const { projects, addProject, removeProject, updateProject, moveToTrash, restoreFromTrash } = useData();
  const [filter, setFilter] = useState('all');
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const onDelete = async (p) => {
    const ok = await confirmDialog({ title: 'Delete project?', message: `Delete "${p.name}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeProject(p.id);
    const entry = moveToTrash('projects', p);
    notifyUndo(`Deleted "${p.name}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  const onDuplicate = (p) => {
    const { id, slug, ...rest } = p;
    addProject({ ...rest, name: `${p.name} (Copy)`, published: false });
  };

  const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter);
  const countFor = (key) => (key === 'all' ? projects.length : projects.filter((p) => p.category === key).length);

  return (
    <>
      <div className="a-topbar">
        <h1>Projects</h1>
        <Link className="a-btn a-btn-primary" to="/admin/projects/new">+ Add Project</Link>
      </div>

      <div className="filters" style={{ marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filter === f.key ? 'active' : ''}
            onClick={() => setFilter(f.key)}
            style={{ padding: '8px 16px', borderRadius: 30, border: '1px solid var(--a-border)', background: filter === f.key ? 'var(--a-primary)' : '#fff', color: filter === f.key ? '#fff' : 'inherit', cursor: 'pointer', fontSize: '.82rem' }}
          >
            {f.label} ({countFor(f.key)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="a-empty">{projects.length === 0 ? 'No projects yet. Add your first one.' : `No ${filter} projects yet.`}</div>
      ) : (
        <table className="a-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Price</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td>
                  {(p.logo || p.coverImage) && (
                    <img
                      className="thumb"
                      src={p.logo || p.coverImage}
                      alt={p.name}
                      style={p.logo ? { objectFit: 'contain', background: '#f4f5f8', padding: 4 } : undefined}
                    />
                  )}
                </td>
                <td>{p.name}<br /><span style={{ fontSize: '0.74rem', color: 'var(--a-muted)' }}>{p.location}</span></td>
                <td>{p.category}</td>
                <td><span className={`status-pill ${p.status}`}>{p.status}</span></td>
                <td>{p.priceLabel}</td>
                <td>
                  <button className={`a-badge ${p.published ? 'ok' : 'off'}`} style={{ border: 0 }} onClick={() => updateProject(p.id, { published: !p.published })}>
                    {p.published ? 'Live' : 'Draft'}
                  </button>
                </td>
                <td className="actions">
                  {p.published && <a className="a-btn a-btn-ghost a-btn-sm" href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">Preview</a>}
                  <Link className="a-btn a-btn-ghost a-btn-sm" to={`/admin/projects/${p.id}`}>Edit</Link>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => onDuplicate(p)}>Duplicate</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
