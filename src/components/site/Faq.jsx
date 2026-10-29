'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { EASE } from './ui';

// Words that carry no meaning for matching.
const STOP = new Set('a an the is are do does can i we you my our your to of in on for and or at with what when how which there it be any this have has'.split(' '));
const words = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
const stem = (w) => w.replace(/(ing|es|s)$/, '');

// Features #27/#96: type a question and the closest answers from our FAQs and policies come first.
function rank(items, q) {
  const qs = words(q).map(stem);
  if (!qs.length) return items;
  return items
    .map((f) => {
      const hay = words(`${f.q} ${f.q} ${f.a}`).map(stem);
      const score = qs.reduce((n, w) => n + hay.filter((h) => h === w || (w.length > 3 && h.startsWith(w))).length, 0);
      return { f, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.f);
}

// Accordion with a plus that turns into a minus.
export default function Faq({ items, first = 0, search = false, extra = [] }) {
  const [open, setOpen] = useState(first);
  const [q, setQ] = useState('');
  const shown = useMemo(() => (q.trim() ? rank([...items, ...extra], q) : items), [items, extra, q]);
  return (
    <div className="acc">
      {search && (
        <div className="faq-ask">
          <label htmlFor="faq-q">Ask a question</label>
          <input id="faq-q" type="search" value={q} placeholder="For example: is there parking? can you arrange a pick-up?" onChange={(e) => { setQ(e.target.value); setOpen(0); }} />
          <p className="faq-count" aria-live="polite">
            {q.trim() ? (shown.length ? `${shown.length} matching ${shown.length === 1 ? 'answer' : 'answers'}` : 'No answer found. Call or WhatsApp us and we will help.') : ''}
          </p>
        </div>
      )}
      {shown.map((f, i) => {
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
