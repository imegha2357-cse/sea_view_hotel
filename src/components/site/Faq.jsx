'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { EASE } from './ui';

// Accordion with a plus that turns into a minus.
export default function Faq({ items, first = 0 }) {
  const [open, setOpen] = useState(first);
  return (
    <div className="acc">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div className="acc-item" key={f.q}>
            <h3 style={{ margin: 0 }}>
              <button className="acc-q" aria-expanded={on} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                {f.q}
                <i className="pm" aria-hidden="true" />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div className="acc-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  <p>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
