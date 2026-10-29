'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Photo from '../Photo';
import Lightbox from '../site/Lightbox';

// A room's photos on its own page: a large photo with thumbnails; any photo opens the full-screen gallery.
export default function RoomGallery({ room }) {
  const imgs = room.images || [];
  const [cur, setCur] = useState(0);
  const [lb, setLb] = useState(null);
  if (!imgs.length) return <div className="frame rgal-empty">Photos coming soon</div>;
  const items = imgs.map((image) => ({ image, alt: room.name }));
  return (
    <div className="rgal">
      <button type="button" className="frame zoom-hover rgal-main" onClick={() => setLb(cur)} aria-label={`Open photo ${cur + 1} of ${imgs.length} full screen`}>
        <Photo k={imgs[cur]} sizes="(max-width: 900px) 100vw, 55vw" alt={`${room.name} at Hotel Sea View`} priority />
        {imgs.length > 1 && <span className="rslide-gallery as-label">Gallery · {imgs.length}</span>}
      </button>
      {imgs.length > 1 && (
        <div className="rgal-thumbs" role="group" aria-label="Room photos">
          {imgs.map((k, i) => (
            <button key={k + i} type="button" className="frame" aria-label={`Show photo ${i + 1}`} aria-current={i === cur ? 'true' : undefined} onClick={() => setCur(i)}>
              <Photo k={k} sizes="120px" alt="" />
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>{lb !== null && <Lightbox items={items} start={lb} onClose={() => setLb(null)} />}</AnimatePresence>
    </div>
  );
}
