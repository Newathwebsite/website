import { useData } from '../../context/DataContext';
import { useConfirm } from '../../components/admin/ConfirmProvider';

const TYPE_LABELS = {
  projects: 'Project', pages: 'Page', blog: 'Blog Post', landingPages: 'Landing Page',
  testimonials: 'Testimonial', newsEvents: 'News & Events', careers: 'Job Opening',
  forms: 'Enquiry Form', media: 'Media', users: 'User',
};

function titleFor(entry) {
  const it = entry.item;
  return it.name || it.title || it.username || it.videoId || 'Untitled';
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TrashAdmin() {
  const { trash, restoreFromTrash, purgeTrashItem, emptyTrash } = useData();
  const confirmDialog = useConfirm();

  const onPurge = async (entry) => {
    const ok = await confirmDialog({
      title: 'Delete forever?',
      message: `Permanently delete "${titleFor(entry)}"? This cannot be undone — it will no longer be in Trash.`,
      confirmLabel: 'Delete Forever',
      danger: true,
    });
    if (ok) purgeTrashItem(entry.id);
  };

  const onEmptyAll = async () => {
    if (!trash.length) return;
    const ok = await confirmDialog({
      title: 'Empty trash?',
      message: `Permanently delete all ${trash.length} item(s) in Trash? This cannot be undone.`,
      confirmLabel: 'Empty Trash',
      danger: true,
    });
    if (ok) emptyTrash();
  };

  return (
    <>
      <div className="a-topbar">
        <h1>Trash</h1>
        {trash.length > 0 && <button className="a-btn a-btn-danger a-btn-sm" onClick={onEmptyAll}>Empty Trash</button>}
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>
        Deleted items land here instead of disappearing right away. Restore anything you deleted by mistake, or delete it forever to remove it for good.
      </p>

      {trash.length === 0 ? (
        <div className="a-empty">Trash is empty.</div>
      ) : (
        <table className="a-table">
          <thead><tr><th>Type</th><th>Name</th><th>Deleted</th><th></th></tr></thead>
          <tbody>
            {trash.map((entry) => (
              <tr key={entry.id}>
                <td><span className="a-badge off">{TYPE_LABELS[entry.type] || entry.type}</span></td>
                <td>{titleFor(entry)}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--a-muted)' }}>{timeAgo(entry.deletedAt)}</td>
                <td className="actions">
                  <button className="a-btn a-btn-primary a-btn-sm" onClick={() => restoreFromTrash(entry.id)}>Restore</button>
                  <button className="a-btn a-btn-danger a-btn-sm" onClick={() => onPurge(entry)}>Delete Forever</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
