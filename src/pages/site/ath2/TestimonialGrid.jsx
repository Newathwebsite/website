import { useState } from 'react';

export default function TestimonialGrid({ testimonials }) {
  const [playingId, setPlayingId] = useState(null);
  const active = testimonials.find((t) => t.id === playingId);

  return (
    <>
      <div className="testi-grid">
        {testimonials.map((t, i) => (
          <div className="testi-card" key={t.id}>
            <button
              type="button"
              aria-label={`Play homeowner video testimonial ${i + 1}`}
              onClick={() => setPlayingId(t.id)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, padding: 0, background: 'none', cursor: 'pointer' }}
            >
              <img src={`https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`} alt="" loading="lazy" />
              <span className="testi-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
              <span className="testi-label">{t.name || `Homeowner Testimonial ${i + 1}`}</span>
            </button>
          </div>
        ))}
      </div>

      <div className={`pd-modal ${active ? 'open' : ''}`}>
        <div className="pd-modal-backdrop" onClick={() => setPlayingId(null)} />
        <div className="pd-modal-box">
          <button type="button" className="pd-modal-close" aria-label="Close" onClick={() => setPlayingId(null)}>✕</button>
          <div className="pd-modal-body">
            {active && (
              <iframe
                src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                allow="autoplay; fullscreen; accelerometer; gyroscope; picture-in-picture"
                allowFullScreen
                title={active.name}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
