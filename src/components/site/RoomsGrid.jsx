'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useState } from 'react';
import { ROOMS } from '@/data/content';
import { RoomCard } from './Cards';
import { EASE } from './ui';

const FILTERS = [
  ['all', 'All rooms'],
  ['sea', 'Sea view'],
  ['family', 'Families'],
  ['city', 'City view'],
];

// Filter chips; cards glide into their new places.
export default function RoomsGrid() {
  const [f, setF] = useState('all');
  const list = f === 'all' ? ROOMS : ROOMS.filter((r) => r.tags.includes(f));
  return (
    <LayoutGroup>
      <div className="g-filters" role="group" aria-label="Filter rooms">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={f === id ? 'on' : ''} aria-pressed={f === id} onClick={() => setF(id)}>
            {label}
          </button>
        ))}
      </div>
      <motion.div layout className="room-grid">
        <AnimatePresence mode="popLayout">
          {list.map((r) => (
            <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, ease: EASE }}>
              <RoomCard r={r} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
