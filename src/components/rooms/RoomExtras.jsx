'use client';

import { useEffect, useRef, useState } from 'react';
import { photo } from '@/data/images';
import Photo from '../Photo';

const KEY = 'sv-recent-rooms';
export const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]').filter((x) => typeof x === 'string');
  } catch {
    return [];
  }
};

// Drag (or use the arrow keys) to look around a 360° / panorama photo. The image repeats so it wraps.
export function Pano({ refKey, title }) {
  const p = photo(refKey);
  const [x, setX] = useState(0);
  const drag = useRef(null);
  const auto = useRef(true);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    const tick = () => {
      if (auto.current) setX((v) => v - 0.25);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!p) return null;
  return (
    <div
      className="pano"
      role="img"
      aria-label={`360° view: ${title}. Drag or use the arrow keys to look around.`}
      tabIndex={0}
      style={{ backgroundImage: `url(${p.src})`, backgroundPositionX: `${x}px` }}
      onPointerDown={(e) => {
        auto.current = false;
        drag.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current === null) return;
        setX((v) => v + (e.clientX - drag.current));
        drag.current = e.clientX;
      }}
      onPointerUp={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          auto.current = false;
          setX((v) => v + (e.key === 'ArrowLeft' ? 60 : -60));
        }
      }}
    >
      <span className="pano-hint">⟷ Drag to look around</span>
    </div>
  );
}

// Extra room details managed in the admin panel: the view from the window, a 360° photo and
// accessibility notes. Also remembers the room for "Recently viewed" on the Rooms page.
export default function RoomExtras({ room }) {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([room.id, ...readRecent().filter((x) => x !== room.id)].slice(0, 6)));
    } catch {}
  }, [room.id]);
  const hasView = photo(room.view_image);
  const has360 = photo(room.tour360);
  const access = room.access || [];
  if (!hasView && !has360 && !access.length) return null;
  return (
    <section className="sec room-extras" aria-label="More about this room">
      <div className="container wide">
        <div className="rx-grid">
          {hasView && (
            <figure className="rx-view">
              <div className="frame">
                <Photo k={room.view_image} sizes="(max-width: 900px) 100vw, 50vw" alt={`The view from the ${room.name}`} />
              </div>
              <figcaption>The view from this room</figcaption>
            </figure>
          )}
          {has360 && (
            <figure className="rx-360">
              <Pano refKey={room.tour360} title={room.name} />
              <figcaption>Look around the {room.name}</figcaption>
            </figure>
          )}
          {access.length > 0 && (
            <div className="rx-access">
              <h2>Accessibility</h2>
              <ul>
                {access.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="meta">Need something else? Tell us when you enquire and we will check.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
