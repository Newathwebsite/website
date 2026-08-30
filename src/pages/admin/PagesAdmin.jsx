import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

export default function PagesAdmin() {
  const { pages, addPage, removePage, moveToTrash, restoreFromTrash } = useData();
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const onDelete = async (p) => {
    const ok = await confirmDialog({ title: 'Delete page?', message: `Delete page "${p.title}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removePage(p.slug);
    const entry = moveToTrash('pages', p);
    notifyUndo(`Deleted "${p.title}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  const onDuplicate = (p) => {
    const { slug, ...rest } = p;
    addPage({ ...rest, title: `${p.title} (Copy)` });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Pages</h1>
        <Link className="a-btn a-btn-primary" to="/admin/pages/new">+ Add Page</Link>
      </div>

      {pages.length === 0 ? (
        <div className="a-empty">No pages yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th>Title</th><th>Slug</th><th>Sections</th><th></th></tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug}>
                <td>{p.title}</td>
                <td>/{p.slug}</td>
                <td>{(p.sections || []).length}</td>
                <td className="actions">
                  <a className="a-btn a-btn-ghost a-btn-sm" href={`/${p.slug}`} target="_blank" rel="noreferrer">Preview</a>
                  <Link className="a-btn a-btn-ghost a-btn-sm" to={`/admin/pages/${p.slug}`}>Edit</Link>
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
