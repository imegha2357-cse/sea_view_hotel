'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { photo } from '@/data/images';
import Photo from '../Photo';
import Lightbox from './Lightbox';
import { EASE } from './ui';

// A row of photos with captions (one wide photo and smaller ones around it). Any photo opens the
// full-screen gallery. Used on inner pages so every page shows the real hotel.
export default function PhotoStrip({ id, title, kicker, text, items, tone = '' }) {
  const [lb, setLb] = useState(null);
  const list = items.filter((x) => photo(x.image));
  if (!list.length) return null;
  return (
    <section className={`sec pstrip ${tone}`} id={id} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="container wide">
        {(title || text) && (
          <div className="pstrip-head">
            {kicker && <p className="rv-k">{kicker}</p>}
            {title && (
              <motion.h2 id={id ? `${id}-h` : undefined} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }}>
                {title}
              </motion.h2>
            )}
            {text && <p className="pstrip-text">{text}</p>}
          </div>
        )}
        <ul className={`pstrip-grid n${Math.min(list.length, 6)}`} role="list">
          {list.map((x, i) => (
            <motion.li key={`${x.image}-${i}`} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: EASE, delay: (i % 6) * 0.07 }}>
              <button type="button" className="pstrip-tile frame zoom-hover" onClick={() => setLb(i)} aria-label={`Open photo: ${x.caption || photo(x.image)?.alt || 'Hotel Sea View'}`}>
                <Photo k={x.image} sizes={i === 0 ? '(max-width: 700px) 100vw, 50vw' : '(max-width: 700px) 50vw, 25vw'} alt="" />
                {x.caption && <span className="pstrip-cap">{x.caption}</span>}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
      <AnimatePresence>{lb !== null && <Lightbox items={list.map((x) => ({ image: x.image, alt: x.caption }))} start={lb} onClose={() => setLb(null)} />}</AnimatePresence>
    </section>
  );
}
