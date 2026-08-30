import { useEffect, useRef, useState } from 'react';
import { TinderFaces } from './ProjectFaces';

export default function TinderDeck({ projects }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [exit, setExit] = useState(null); // 'left' | 'right' | null
  const dragRef = useRef({ startX: 0, curX: 0, dragging: false, wasDragged: false });
  const [dragStyle, setDragStyle] = useState({});

  useEffect(() => { setIndex(0); setFlipped(false); setExit(null); }, [projects]);

  if (!projects.length) return null;
  const safeIndex = ((index % projects.length) + projects.length) % projects.length;
  const stackSize = Math.min(3, projects.length);

  const advance = (dir) => {
    setExit(dir > 0 ? 'right' : 'left');
    setTimeout(() => {
      setIndex((i) => i + dir);
      setFlipped(false);
      setExit(null);
      setDragStyle({});
    }, 260);
  };

  const onPointerDown = (e) => {
    if (e.target.closest('.tf-more')) return;
    dragRef.current = { startX: e.clientX, curX: 0, dragging: true, wasDragged: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.curX = e.clientX - d.startX;
    if (Math.abs(d.curX) > 6) d.wasDragged = true;
    setDragStyle({ '--drag-x': `${d.curX}px`, '--drag-rot': `${d.curX / 16}deg` });
  };
  const endDrag = () => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    if (Math.abs(d.curX) > 70) {
      advance(d.curX > 0 ? 1 : -1);
    } else {
      setDragStyle({ '--drag-x': '0px', '--drag-rot': '0deg' });
    }
  };
  const onCardClick = () => {
    const d = dragRef.current;
    if (d.wasDragged) { d.wasDragged = false; return; }
    setFlipped((f) => !f);
  };

  const cards = [];
  for (let i = 0; i < stackSize; i++) {
    const p = projects[(safeIndex + i) % projects.length];
    const style = i === 0
      ? { '--stack-scale': 1, '--stack-y': '0px', zIndex: 10, opacity: 1, ...dragStyle, ...(exit ? { transform: `translateX(${exit === 'right' ? '140%' : '-140%'}) rotate(${exit === 'right' ? 18 : -18}deg)`, opacity: 0 } : {}) }
      : { '--stack-scale': 1 - i * 0.05, '--stack-y': `${i * 14}px`, zIndex: 10 - i, opacity: i === 2 ? 0.6 : 0.85, pointerEvents: 'none' };
    cards.push(
      <div
        className={`tinder-card ${i === 0 && flipped ? 'flipped' : ''} ${i === 0 && dragRef.current.dragging ? 'dragging' : ''}`}
        key={p.id}
        style={style}
        {...(i === 0 ? {
          onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag,
          onClick: onCardClick,
        } : {})}
      >
        <TinderFaces project={p} />
      </div>
    );
  }

  return (
    <div className="tinder-stage">
      <div className="tinder-deck">{cards}</div>
      <div className="tinder-controls">
        <button type="button" className="tinder-btn tinder-prev" aria-label="Previous project" onClick={() => advance(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button type="button" className="tinder-btn tinder-flip" aria-label="Flip card" onClick={() => setFlipped((f) => !f)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2.1l4 4-4 4M3 12.9v-1a4 4 0 0 1 4-4h14M7 21.9l-4-4 4-4M21 11.1v1a4 4 0 0 1-4 4H3" /></svg>
        </button>
        <button type="button" className="tinder-btn tinder-next" aria-label="Next project" onClick={() => advance(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <div className="tinder-progress">
        {projects.map((_, i) => <span key={i} className={i === safeIndex ? 'on' : ''} />)}
      </div>
    </div>
  );
}
