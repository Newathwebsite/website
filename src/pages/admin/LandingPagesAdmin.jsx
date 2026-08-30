import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

export default function LandingPagesAdmin() {
  const { landingPages, addLandingPage, removeLandingPage, moveToTrash, restoreFromTrash } = useData();
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const onDelete = async (p) => {
    const ok = await confirmDialog({ title: 'Delete landing page?', message: `Delete landing page "${p.name}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeLandingPage(p.id);
    const entry = moveToTrash('landingPages', p);
    notifyUndo(`Deleted "${p.name}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  const onDuplicate = (p) => {
    const { id, slug, subdomain, ...rest } = p;
    addLandingPage({ ...rest, name: `${p.name} (Copy)`, published: false });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Landing Pages</h1>
        <Link className="a-btn a-btn-primary" to="/admin/landing-pages/new">+ Add Landing Page</Link>
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>
        Each one is a focused, single-page design — hero + editable sections + one enquiry form — reachable at <code>/lp/&lt;slug&gt;</code> on this site.
        Set a subdomain below to also serve it there once you've pointed that subdomain's DNS at this same deployment (a hosting step outside this admin panel).
      </p>

      {landingPages.length === 0 ? (
        <div className="a-empty">No landing pages yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th>Name</th><th>Path</th><th>Subdomain</th><th>Published</th><th></th></tr></thead>
          <tbody>
            {landingPages.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>/lp/{p.slug}</td>
                <td style={{ fontSize: '.78rem', color: 'var(--a-muted)' }}>{p.subdomain || '—'}</td>
                <td>{p.published ? 'Yes' : 'No'}</td>
                <td className="actions">
                  {p.published && <a className="a-btn a-btn-ghost a-btn-sm" href={`/lp/${p.slug}`} target="_blank" rel="noreferrer">Preview</a>}
                  <Link className="a-btn a-btn-ghost a-btn-sm" to={`/admin/landing-pages/${p.id}`}>Edit</Link>
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
