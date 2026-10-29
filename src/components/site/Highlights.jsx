'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Photo from '../Photo';
import { Chevron, EASE, LineTitle } from './ui';

// The layout from the Taj reference: the current photo, blurred and darkened, fills the band; on top sits
// a card with the photo on the left and a white text panel on the right; round arrows either side.
export default function Highlights({ slides, title = 'Highlights', id = 'highlights' }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = slides.length;
  const go = useCallback(
    (d) => {
      setDir(d);
      setI((x) => (x + d + n) % n);
    },
    [n]
  );
  useEffect(() => {
    if (paused || reduce) return undefined;
    const t = setTimeout(() => go(1), 7000);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go]);

  const s = slides[i];
  return (
    <section className="hl" id={id} aria-roledescription="carousel" aria-labelledby={`${id}-h`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <AnimatePresence initial={false}>
        <motion.div key={s.image} className="hl-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} aria-hidden="true">
          <Photo k={s.image} sizes="40vw" alt="" quality={40} />
        </motion.div>
      </AnimatePresence>
      <div className="container wide">
        <div className="hl-head">
          <LineTitle id={`${id}-h`}>{title}</LineTitle>
        </div>
        <div className="hl-stage">
          <motion.div className="hl-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, ease: EASE }}>
            <div className="frame" style={{ overflow: 'hidden' }}>
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={s.image}
                  style={{ position: 'absolute', inset: 0 }}
                  custom={dir}
                  initial={{ x: `${dir * 100}%` }}
                  animate={{ x: '0%' }}
                  exit={{ x: `${dir * -30}%`, opacity: 0.4 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => (info.offset.x < -60 ? go(1) : info.offset.x > 60 ? go(-1) : null)}
                >
                  <Photo k={s.image} sizes="(max-width: 820px) 100vw, 45vw" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="hl-text" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={s.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE }} style={{ display: 'grid', gap: 18 }}>
                  <span className="hl-count">
                    {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {s.href && (
                    <Link href={s.href} className="more-link">
                      {s.cta || 'More'} <Chevron />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="hl-arrows">
            <button className="round-btn" onClick={() => go(-1)} aria-label="Previous highlight">
              <Chevron dir="left" />
            </button>
            <button className="round-btn" onClick={() => go(1)} aria-label="Next highlight">
              <Chevron />
            </button>
          </div>
        </div>
        <div className="hl-dots">
          {slides.map((x, k) => (
            <button
              key={x.title}
              aria-label={`Show ${x.title}`}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => {
                setDir(k > i ? 1 : -1);
                setI(k);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
