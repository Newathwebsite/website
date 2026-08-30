import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FanFace, projectHref } from './ProjectFaces';

function positionStyle(i, active, total) {
  let d = i - active;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  const abs = Math.abs(d);
  if (abs > 2) return { opacity: 0, pointerEvents: 'none', zIndex: 0 };
  const tx = d * 170, scale = 1 - abs * 0.16, rot = d * -14, tz = -abs * 60;
  return {
    transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rot}deg) scale(${scale})`,
    opacity: 1 - abs * 0.28,
    zIndex: 50 - abs,
    pointerEvents: 'auto',
  };
}

export default function ProjFan({ projects }) {
  const [fanIndex, setFanIndex] = useState(0);
  const navigate = useNavigate();
  const dragRef = useRef({ dragging: false, startX: 0, curX: 0, wasDragged: false });

  if (!projects.length) return null;
  const total = projects.length;

  const advance = (dir) => setFanIndex((i) => (i + dir + total) % total);

  const onClick = (i) => {
    if (dragRef.current.wasDragged) { dragRef.current.wasDragged = false; return; }
    if (i === fanIndex) navigate(projectHref(projects[i]));
    else setFanIndex(i);
  };

  const onPointerDown = (e) => { dragRef.current = { dragging: true, startX: e.clientX, curX: 0, wasDragged: false }; };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.curX = e.clientX - d.startX;
    if (Math.abs(d.curX) > 6) d.wasDragged = true;
  };
  const endDrag = () => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    if (Math.abs(d.curX) > 60) advance(d.curX < 0 ? 1 : -1);
    d.curX = 0;
  };
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();
    advance(e.deltaX > 0 ? 1 : -1);
  };

  return (
    <div className="proj-fan-wrap">
      <div
        className="proj-fan"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
      >
        {projects.map((p, i) => (
          <div
            key={p.id}
            className={`proj-fan-card ${dragRef.current.dragging ? 'dragging' : ''}`}
            style={positionStyle(i, fanIndex, total)}
            tabIndex={0}
            role="link"
            aria-label={`View ${p.name}`}
            onClick={() => onClick(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(i); } }}
          >
            <FanFace project={p} />
          </div>
        ))}
      </div>
      <div className="proj-fan-controls">
        <button type="button" className="proj-fan-btn proj-fan-prev" aria-label="Previous project" onClick={() => advance(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="proj-fan-hint">Drag · Scroll · Arrows</span>
        <button type="button" className="proj-fan-btn proj-fan-next" aria-label="Next project" onClick={() => advance(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <div className="proj-fan-dots">
        {projects.map((_, i) => <span key={i} className={i === fanIndex ? 'on' : ''} />)}
      </div>
    </div>
  );
}
