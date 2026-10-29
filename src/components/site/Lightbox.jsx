'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { photo } from '@/data/images';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import Photo from '../Photo';
import { Chevron, EASE } from './ui';

// Full-screen gallery: zooms in, arrow keys and swipe to move, thumbnails to jump, Esc to close.
export default function Lightbox({ items, start = 0, onClose }) {
  const [i, setI] = useState(start);
  const [dir, setDir] = useState(1);
  const closeRef = useRef(null);
  const n = items.length;
  const go = useCallback(
    (d) => {
      setDir(d);
      setI((x) => (x + d + n) % n);
    },
    [n]
  );
  useEffect(() => {
    lockScroll();
    const prev = document.activeElement;
    closeRef.current?.focus();
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', k);
      prev?.focus?.();
    };
  }, [go, onClose]);

  const it = items[i];
  return (
    <motion.div className="lb" role="dialog" aria-modal="true" aria-label="Photo gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} data-lenis-prevent>
      <div className="lb-top">
        <span aria-live="polite">
          {i + 1} / {n} · {it.caption || photo(it.image).alt}
        </span>
        <button ref={closeRef} className="lb-close" onClick={onClose} aria-label="Close gallery">
          ×
        </button>
      </div>
      <div className="lb-stage">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={it.image}
            className="lb-img"
            custom={dir}
            initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: dir * -80 }}
            transition={{ duration: 0.45, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
          >
            <Photo k={it.image} sizes="92vw" quality={90} />
          </motion.div>
        </AnimatePresence>
        <div className="lb-nav">
          <button className="round-btn" onClick={() => go(-1)} aria-label="Previous photo">
            <Chevron dir="left" />
          </button>
          <button className="round-btn" onClick={() => go(1)} aria-label="Next photo">
            <Chevron />
          </button>
        </div>
      </div>
      <div className="lb-thumbs">
        {items.map((t, k) => (
          <button
            key={t.image + k}
            aria-label={`Photo ${k + 1}`}
            aria-current={k === i ? 'true' : undefined}
            onClick={() => {
              setDir(k > i ? 1 : -1);
              setI(k);
            }}
          >
            <Photo k={t.image} sizes="90px" alt="" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
