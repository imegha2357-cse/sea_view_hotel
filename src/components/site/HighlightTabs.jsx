'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { HIGHLIGHTS } from '@/data/content';
import Photo from '../Photo';
import { FacilityIcon } from '../Icons';
import { Chevron, EASE } from './ui';

const ICONS = ['bed', 'pin', 'car', 'bell'];

// "Hotel highlights" (from the original site, rebuilt): a list on the left works as tabs; the photo on the
// right crossfades with a slow zoom, a white card slides in over it, and two square arrows step through.
// No visitor statistics are shown: the old site's figures could not be verified (defect audit #4).
export default function HighlightTabs() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = HIGHLIGHTS.length;
  const go = useCallback((d) => setI((x) => (x + d + n) % n), [n]);
  useEffect(() => {
    if (paused || reduce) return undefined;
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go]);
  const h = HIGHLIGHTS[i];
  return (
    <section className="sec cream htabs" aria-labelledby="htabs-h" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div className="container wide htabs-grid">
        <div className="htabs-copy">
          <span className="tag-line">Our highlights</span>
          <h2 id="htabs-h" className="sec-title">Hotel highlights</h2>
          <p className="lead">Comfortable rooms, a central location and help whenever you need it, from arrival to check-out.</p>
          <div className="htabs-list" role="tablist" aria-label="Highlights">
            {HIGHLIGHTS.map((x, k) => (
              <button key={x.title} role="tab" id={`htab-${k}`} aria-selected={k === i} aria-controls="htab-panel" className={k === i ? 'on' : ''} onClick={() => setI(k)}>
                <span>{x.title}</span>
                {k === i && <motion.i layoutId="htab-bar" className="htab-bar" transition={{ duration: 0.45, ease: EASE }} />}
                {k === i && !paused && !reduce && <motion.b key={`p${i}`} className="htab-progress" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6, ease: 'linear' }} />}
              </button>
            ))}
          </div>
        </div>
        <div className="htabs-stage" id="htab-panel" role="tabpanel" aria-labelledby={`htab-${i}`}>
          <div className="htabs-photo">
            <AnimatePresence initial={false}>
              <motion.div key={h.image} className="htabs-img" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: EASE }}>
                <Photo k={h.image} sizes="(max-width: 900px) 100vw, 55vw" />
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={h.title} className="htabs-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.55, ease: EASE }}>
              <span className="htabs-icon">
                <FacilityIcon name={ICONS[i]} />
              </span>
              <h3>{h.title}</h3>
              <p>{h.text}</p>
            </motion.div>
          </AnimatePresence>
          <div className="htabs-arrows">
            <button onClick={() => go(-1)} aria-label="Previous highlight">
              <Chevron dir="left" />
            </button>
            <button onClick={() => go(1)} aria-label="Next highlight">
              <Chevron />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
