'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { HERO_SLIDES } from '@/data/content';
import Photo from '../Photo';
import BookingBar from './BookingBar';
import Lightbox from './Lightbox';
import { Chevron, EASE, KenBurns } from './ui';

const DELAY = 6500;

// Taj hero: full-screen photos that crossfade with a slow zoom, round arrows, title with a drawn rule,
// a "Gallery" chip and the booking bar along the bottom.
export default function Hero({ title = 'Hotel Sea View, Kanyakumari', slides = HERO_SLIDES, gallery }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lb, setLb] = useState(null);
  const reduce = useReducedMotion();
  const n = slides.length;
  const go = useCallback((d) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (paused || reduce || n < 2) return undefined;
    const t = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go, n]);

  const s = slides[i];
  return (
    <section className="hero" data-hero aria-roledescription="carousel" aria-label="Photos of the hotel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <AnimatePresence initial={false}>
        <motion.div key={s.image} className="hero-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'easeInOut' }} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}: ${s.caption}`}>
          <KenBurns duration={DELAY / 1000 + 2}>
            <Photo k={s.image} sizes="(orientation: portrait) 240vh, 100vw" priority={i === 0} />
          </KenBurns>
        </motion.div>
      </AnimatePresence>

      {n > 1 && (
        <div className="hero-arrows">
          <button className="round-btn" onClick={() => go(-1)} aria-label="Previous photo">
            <Chevron dir="left" />
          </button>
          <button className="round-btn" onClick={() => go(1)} aria-label="Next photo">
            <Chevron />
          </button>
        </div>
      )}

      <div className="hero-bottom">
        <div className="container wide">
          <AnimatePresence mode="wait">
            <motion.p key={s.caption} className="hero-caption" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} aria-live="polite">
              {s.caption}
            </motion.p>
          </AnimatePresence>
          <div className="hero-title-row">
            <motion.h1 className="hero-title" initial="hide" animate="show">
              <motion.span className="line" aria-hidden="true" variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease: EASE, delay: 0.3 } } }} />
              <motion.span variants={{ hide: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 0.45 } } }}>{title}</motion.span>
            </motion.h1>
            {gallery?.length > 0 && (
              <motion.button className="gallery-chip" onClick={() => setLb(0)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6, ease: EASE }} aria-label={`Open the gallery, ${gallery.length} photos`}>
                <span className="thumbs" aria-hidden="true">
                  {gallery.slice(0, 4).map((g) => (
                    <span key={g.image}>
                      <Photo k={g.image} sizes="30px" alt="" />
                    </span>
                  ))}
                </span>
                Gallery
              </motion.button>
            )}
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: EASE }}>
            <BookingBar />
          </motion.div>
        </div>
      </div>
      <AnimatePresence>{lb !== null && <Lightbox items={gallery} start={lb} onClose={() => setLb(null)} />}</AnimatePresence>
    </section>
  );
}
