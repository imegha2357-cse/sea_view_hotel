import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FAQS, POLICIES } from '../data/content';
import { EASE, Reveal, SectionHeading } from '../components/Motion';

// #83 accordion, #84 plus-to-minus
export default function Faq() {
  const [open, setOpen] = useState(0);
  const [q, setQ] = useState('');
  // Feature #27: search the questions and the hotel policies together.
  const list = useMemo(() => {
    const all = [...FAQS, ...POLICIES.filter((p) => p.confirmed).map((p) => ({ q: p.title, a: p.text }))];
    const s = q.trim().toLowerCase();
    if (!s) return FAQS;
    return all.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(s));
  }, [q]);
  return (
    <section className="section" id="faq">
      <div className="container">
        <SectionHeading center eyebrow="Good to know" title="Frequently asked questions" />
        <div className="faq-search">
          <label className="sr-only" htmlFor="faq-q">
            Search questions
          </label>
          <input id="faq-q" type="search" placeholder="Search: parking, children, room service…" value={q} onChange={(e) => { setQ(e.target.value); setOpen(0); }} />
        </div>
        <div className="faq" aria-live="polite">
          {list.length === 0 && <p className="faq-none">No answer found. Call or WhatsApp us and we will help.</p>}
          {list.map((f, i) => {
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
        <p className="faq-more">
          <Link to="/policies" className="link-arrow">
            All hotel policies <i>→</i>
          </Link>
        </p>
      </div>
    </section>
  );
}
