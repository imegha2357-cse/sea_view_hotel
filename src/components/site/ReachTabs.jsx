'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { HOW_TO_REACH } from '@/data/content';
import { EASE } from './ui';

// "How to reach" tabs with a sliding underline (Taj location block).
export default function ReachTabs() {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="reach-tabs" role="tablist" aria-label="How to reach us">
        {HOW_TO_REACH.map((h, k) => (
          <button key={h.mode} role="tab" id={`reach-t-${k}`} aria-selected={i === k} aria-controls="reach-panel" className={i === k ? 'on' : ''} onClick={() => setI(k)}>
            {h.mode}
            {i === k && <motion.span layoutId="reach-line" className="tab-line" transition={{ duration: 0.35, ease: EASE }} />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={i} id="reach-panel" role="tabpanel" aria-labelledby={`reach-t-${i}`} className="lead" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
          {HOW_TO_REACH[i].text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
