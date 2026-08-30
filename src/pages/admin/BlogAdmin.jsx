import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useConfirm, useUndoToast } from '../../components/admin/ConfirmProvider';

export default function BlogAdmin() {
  const { blogPosts, addBlogPost, removeBlogPost, updateBlogPost, moveToTrash, restoreFromTrash } = useData();
  const confirmDialog = useConfirm();
  const notifyUndo = useUndoToast();

  const onDelete = async (p) => {
    const ok = await confirmDialog({ title: 'Delete blog post?', message: `Delete blog post "${p.title}"? It will be moved to Trash and can be restored later.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    removeBlogPost(p.id);
    const entry = moveToTrash('blog', p);
    notifyUndo(`Deleted "${p.title}". Moved to Trash.`, () => restoreFromTrash(entry.id));
  };

  const onDuplicate = (p) => {
    const { id, slug, ...rest } = p;
    addBlogPost({ ...rest, title: `${p.title} (Copy)`, published: false });
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Blog</h1>
        <Link className="a-btn a-btn-primary" to="/admin/blog/new">+ Add Post</Link>
      </div>

      {blogPosts.length === 0 ? (
        <div className="a-empty">No blog posts yet.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th></th><th>Title</th><th>Date</th><th>Published</th><th></th></tr></thead>
          <tbody>
            {blogPosts.map((p) => (
              <tr key={p.id}>
                <td>{p.coverImage && <img className="thumb" src={p.coverImage} alt="" />}</td>
                <td>{p.title}<br /><span style={{ fontSize: '0.74rem', color: 'var(--a-muted)' }}>/blog/{p.slug}</span></td>
                <td>{p.date}</td>
                <td>
                  <button className={`a-badge ${p.published ? 'ok' : 'off'}`} style={{ border: 0 }} onClick={() => updateBlogPost(p.id, { published: !p.published })}>
                    {p.published ? 'Live' : 'Draft'}
                  </button>
                </td>
                <td className="actions">
                  {p.published && <a className="a-btn a-btn-ghost a-btn-sm" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">Preview</a>}
                  <Link className="a-btn a-btn-ghost a-btn-sm" to={`/admin/blog/${p.id}`}>Edit</Link>
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
