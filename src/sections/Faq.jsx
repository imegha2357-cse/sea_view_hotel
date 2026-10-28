import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAQS } from '../data/content';
import { EASE, Reveal, SectionHeading } from '../components/Motion';

// #83 accordion, #84 plus-to-minus
export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="container">
        <SectionHeading center eyebrow="Good to know" title="Frequently asked questions" />
        <div className="faq">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} i={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <h3 style={{ margin: 0, fontSize: 'inherit' }}>
                  <button className="faq-q" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    {f.q}
                    <i className="pm" aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`faq-${i}`} className="faq-a" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
