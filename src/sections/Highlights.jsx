import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HIGHLIGHTS } from '../data/content';
import SmartImg from '../components/SmartImg';
import { EASE, Eyebrow, SplitWords } from '../components/Motion';

// "Hotel highlights" from the original site: pick a highlight and its photo wipes in.
// Advances every 5 s with a progress line; pauses on hover or keyboard focus.
const STEP = 5000;

export default function Highlights() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const go = (n) => {
    setDir(n > i || (i === HIGHLIGHTS.length - 1 && n === 0) ? 1 : -1);
    setI((n + HIGHLIGHTS.length) % HIGHLIGHTS.length);
  };

  useEffect(() => {
    if (paused || reduce) return undefined;
    const t = setTimeout(() => go(i + 1), STEP);
    return () => clearTimeout(t);
  }, [i, paused, reduce]);

  const h = HIGHLIGHTS[i];
  return (
    <section className="section highlights-sec" id="highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="container hl-grid">
        <div className="hl-list">
          <Eyebrow>Hotel highlights</Eyebrow>
          <SplitWords text="Why guests choose Sea View" className="hl-title" />
          <ul role="tablist" aria-label="Hotel highlights">
            {HIGHLIGHTS.map((x, k) => (
              <li key={x.title}>
                <button role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => go(k)} onMouseEnter={() => go(k)}>
                  {x.title}
                  <span className="hl-bar" aria-hidden="true">
                    {k === i && <motion.i key={`${i}-${paused}`} initial={{ scaleX: 0 }} animate={{ scaleX: paused || reduce ? 1 : 1 }} transition={{ duration: paused || reduce ? 0.3 : STEP / 1000, ease: 'linear' }} />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="hl-stage">
          <div className="hl-photo">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={h.image}
                className="hl-photo-in"
                custom={dir}
                initial={{ clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0%)' }}
                exit={{ opacity: 0.6 }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
              >
                <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }} style={{ width: '100%', height: '100%' }}>
                  <SmartImg name={h.image} sizes="(max-width: 860px) 100vw, 55vw" width={1200} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="hl-card">
            <AnimatePresence mode="wait">
              <motion.p key={h.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} aria-live="polite">
                {h.text}
              </motion.p>
            </AnimatePresence>
            <div className="hl-arrows">
              <button onClick={() => go(i - 1)} aria-label="Previous highlight">
                ←
              </button>
              <button onClick={() => go(i + 1)} aria-label="Next highlight">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
