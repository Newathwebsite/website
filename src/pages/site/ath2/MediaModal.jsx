// Small reusable video-embed modal shared by the alternate project card
// styles (FlipCard2, PremiumCard2) — opens a real video URL (walkthrough,
// route map, etc.) inline instead of faking a play button that does nothing.
export default function MediaModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div className="pd-modal open" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <div className="pd-modal-backdrop" onClick={onClose} />
      <div className="pd-modal-box">
        <button type="button" className="pd-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        <div className="pd-modal-body">
          <iframe src={url} allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture" allowFullScreen title="Project media" />
        </div>
      </div>
    </div>
  );
}
