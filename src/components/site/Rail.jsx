'use client';

import { useEffect, useRef, useState } from 'react';
import { Chevron } from './ui';

// Horizontal card row with snap scrolling and arrow buttons (Taj rooms and offers rows).
export default function Rail({ title, children, label = 'items' }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  const move = (d) => {
    const el = ref.current;
    const card = el?.firstElementChild;
    if (!card) return;
    el.scrollBy({ left: d * (card.getBoundingClientRect().width + 24), behavior: 'smooth' });
  };
  return (
    <div className="rail-wrap">
      <div className="sec-head-row">
        {title}
        <div className="rail-nav">
          <button className="round-btn dark" onClick={() => move(-1)} disabled={edge.start} aria-label={`Previous ${label}`}>
            <Chevron dir="left" />
          </button>
          <button className="round-btn dark" onClick={() => move(1)} disabled={edge.end} aria-label={`Next ${label}`}>
            <Chevron />
          </button>
        </div>
      </div>
      <div className="rail" ref={ref} tabIndex={0} aria-label={label}>
        {children}
      </div>
    </div>
  );
}
