'use client';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import Photo from '../Photo';
import Lightbox from '../site/Lightbox';
import { Chevron } from '../site/ui';
import RoomFacts from './RoomFacts';
import RoomModal from './RoomModal';

const enquire = (r) => `/enquire?room_type=${encodeURIComponent(r.name)}`;

function RoomSlide({ r, onMore, onGallery }) {
  const n = r.images?.length || 0;
  return (
    <article className="rslide" aria-roledescription="slide" aria-label={r.name}>
      <div className="rslide-photo frame zoom-hover">
        {n > 0 ? (
          <Photo k={r.images[0]} sizes="(max-width: 700px) 86vw, (max-width: 1100px) 60vw, 40vw" alt={`${r.name} at Hotel Sea View`} />
        ) : (
          <span className="rslide-nophoto">Photos coming soon</span>
        )}
        {n > 0 && (
          <button type="button" className="rslide-gallery" onClick={onGallery} aria-label={`Open gallery: ${r.name}, ${n} photo${n === 1 ? '' : 's'}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h14v12H3z M7 3h14v12" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Gallery{n > 1 ? ` · ${n}` : ''}
          </button>
        )}
      </div>
      <div className="rslide-body">
        <h3>
          <Link href={`/rooms/${r.id}`}>{r.name}</Link>
        </h3>
        {r.summary && (
          <p className="rslide-text">
            {r.summary}{' '}
            <button type="button" className="rslide-dots" onClick={onMore} aria-label={`More about ${r.name}`}>
              »
            </button>
          </p>
        )}
        <RoomFacts room={r} />
        <div className="rslide-actions">
          <button type="button" className="rslide-more" onClick={onMore} aria-haspopup="dialog">
            More
          </button>
          <Link href={enquire(r)} className="btn solid sm">
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}

// Taj Lands End "Rooms and suites" carousel: the active card in the middle with its neighbours peeking
// in, arrows and dots, a Gallery chip on each photo and a "More" window with the full details.
export default function RoomCarousel({ rooms, label = 'Rooms' }) {
  const track = useRef(null);
  const [active, setActive] = useState(0);
  const [more, setMore] = useState(null);
  const [gallery, setGallery] = useState(null);

  const slides = () => Array.from(track.current?.children || []);
  const go = useCallback((i) => {
    const el = slides()[i];
    if (!el || !track.current) return;
    const t = track.current;
    const left = el.offsetLeft - (t.clientWidth - el.clientWidth) / 2;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    t.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    const t = track.current;
    if (!t) return undefined;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = t.scrollLeft + t.clientWidth / 2;
        let best = 0;
        let dist = Infinity;
        slides().forEach((el, i) => {
          const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - mid);
          if (d < dist) {
            dist = d;
            best = i;
          }
        });
        setActive(best);
      });
    };
    on();
    t.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [rooms.length]);

  if (!rooms.length) return null;
  const n = rooms.length;
  const closeMore = () => setMore(null);
  const closeGallery = () => setGallery(null);
  const g = gallery !== null ? rooms[gallery] : null;

  return (
    <div className="rcar" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        className={`rcar-track ${n === 1 ? 'single' : ''}`}
        ref={track}
        tabIndex={0}
        aria-label={`${label}: use the arrow keys or swipe to see more`}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'ArrowRight') go(Math.min(n - 1, active + 1));
          if (e.key === 'ArrowLeft') go(Math.max(0, active - 1));
        }}
      >
        {rooms.map((r, i) => (
          <div key={r.id} className={`rcar-cell ${i === active ? 'on' : ''}`}>
            <RoomSlide r={r} onMore={() => setMore(r)} onGallery={() => setGallery(i)} />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="rcar-nav">
          <button type="button" className="round-btn dark" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous room">
            <Chevron dir="left" />
          </button>
          <div className="rcar-dots">
            {rooms.map((r, i) => (
              <button key={r.id} type="button" aria-label={`Show ${r.name}`} aria-current={i === active ? 'true' : undefined} onClick={() => go(i)} />
            ))}
          </div>
          <button type="button" className="round-btn dark" onClick={() => go(Math.min(n - 1, active + 1))} disabled={active === n - 1} aria-label="Next room">
            <Chevron />
          </button>
        </div>
      )}
      <AnimatePresence>{more && <RoomModal key="m" room={more} onClose={closeMore} />}</AnimatePresence>
      <AnimatePresence>{g && <Lightbox key="g" items={g.images.map((image) => ({ image, alt: g.name }))} onClose={closeGallery} />}</AnimatePresence>
    </div>
  );
}
