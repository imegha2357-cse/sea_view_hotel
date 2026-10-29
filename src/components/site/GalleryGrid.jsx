'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { photo } from '@/data/images';
import Photo from '../Photo';
import Lightbox from './Lightbox';
import { EASE } from './ui';

const SHAPES = ['big', '', 'tall', '', '', '', 'big', '', '', 'tall', '', ''];

// Filterable photo grid; tiles re-flow with a layout animation and open the full-screen gallery.
export default function GalleryGrid({ items, filters = true }) {
  const cats = useMemo(() => ['All', ...Array.from(new Set(items.map((g) => g.cat)))], [items]);
  const [cat, setCat] = useState('All');
  const [lb, setLb] = useState(null);
  const list = cat === 'All' ? items : items.filter((g) => g.cat === cat);
  return (
    <LayoutGroup>
      {filters && (
        <div className="g-filters" role="group" aria-label="Filter photos">
          {cats.map((c) => (
            <button key={c} className={cat === c ? 'on' : ''} aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      <motion.div layout className="g-grid">
        <AnimatePresence>
          {list.map((g, i) => (
            <motion.button
              layout
              key={`${g.image}-${g.cat}`}
              className={`g-tile zoom-hover ${cat === 'All' ? SHAPES[i % SHAPES.length] : ''}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={() => setLb(i)}
              aria-label={`Open photo: ${g.alt || photo(g.image)?.alt || g.cat || "Hotel Sea View"}`}
            >
              <Photo k={g.image} sizes="(max-width: 900px) 50vw, 33vw" alt="" />
              <span>{g.cat}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>{lb !== null && <Lightbox items={list} start={lb} onClose={() => setLb(null)} />}</AnimatePresence>
    </LayoutGroup>
  );
}
