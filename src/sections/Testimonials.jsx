import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TESTIMONIALS } from '../data/content';
import { EASE, SectionHeading } from '../components/Motion';

// WS-09: shows only client-approved testimonials with permission and accurate attribution.
// The whole section stays hidden while TESTIMONIALS in src/data/content.js is empty.
// #85 crossfade every 6 s, paused on hover, focus and touch.
export default function Testimonials() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    if (count < 2 || paused || reduce) return undefined;
    const t = setTimeout(() => setI((n) => (n + 1) % count), 6000);
    return () => clearTimeout(t);
  }, [i, paused, reduce, count]);

  if (!count) return null;
  const t = TESTIMONIALS[i];

  return (
    <section className="section white" id="reviews" aria-roledescription="carousel" aria-label="Guest reviews">
      <div className="container">
        <SectionHeading center eyebrow="Guest reviews" title="What our guests say" />
        <div
          className="reviews"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          <span className="quote-mark" aria-hidden="true">
            “
          </span>
          <AnimatePresence mode="wait">
            <motion.figure key={i} className="review" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }} aria-live="polite">
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <b>{t.name}</b>
                {[t.from, t.date, t.source].filter(Boolean).join(' · ')}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {count > 1 && (
            <div className="review-dots" role="tablist" aria-label="Choose review">
              {TESTIMONIALS.map((r, k) => (
                <button key={k} role="tab" aria-selected={k === i} aria-label={`Review ${k + 1} of ${count}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
