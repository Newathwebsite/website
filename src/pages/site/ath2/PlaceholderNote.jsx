export default function PlaceholderNote({ page }) {
  if (!page?.placeholderNote) return null;
  const [title, ...rest] = page.placeholderNote.split('. ');
  return (
    <div className="placeholder-note rv">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flex: 'none' }}><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16h.01" /></svg>
      <div>
        <b>{title}.</b>
        {rest.join('. ')}
      </div>
    </div>
  );
}
