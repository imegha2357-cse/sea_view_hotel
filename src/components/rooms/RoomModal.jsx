'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { amenity } from '@/data/catalog';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { rupees } from '@/lib/enquiry';
import Photo from '../Photo';
import RoomFacts from './RoomFacts';
import { EASE } from '../site/ui';

const enquire = (r) => `/enquire?room_type=${encodeURIComponent(r.name)}`;

// "More" window for a room type (Taj Lands End): description, facts, highlights,
// services and amenities, and the way to ask for rates.
export default function RoomModal({ room: r, onClose }) {
  const closeRef = useRef(null);
  const boxRef = useRef(null);
  useEffect(() => {
    lockScroll();
    const prev = document.activeElement;
    closeRef.current?.focus();
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      // Keep Tab inside the window.
      if (e.key === 'Tab' && boxRef.current) {
        const f = boxRef.current.querySelectorAll('a[href], button:not([disabled])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', key);
      prev?.focus?.();
    };
  }, [onClose]);

  const amen = (r.amenities || []).map(amenity).filter(Boolean);
  const text = r.description || r.summary || '';
  return (
    <motion.div className="rmodal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose} data-lenis-prevent>
      <motion.div
        ref={boxRef}
        className="rmodal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`rm-${r.id}`}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="rmodal-close" onClick={onClose}>
          Close <span aria-hidden="true">×</span>
        </button>
        <div className="rmodal-scroll">
          {r.images?.[0] && (
            <div className="frame rmodal-photo">
              <Photo k={r.images[0]} sizes="(max-width: 760px) 92vw, 720px" alt="" />
            </div>
          )}
          <h2 id={`rm-${r.id}`}>{r.name}</h2>
          {r.view && <p className="tag-line">{r.view}</p>}
          {text
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
          <RoomFacts room={r} />
          {r.features?.length > 0 && (
            <ul className="rmodal-high" aria-label="Highlights">
              {r.features.map((f) => (
                <li key={f}>
                  <span aria-hidden="true">✦</span> {f}
                </li>
              ))}
            </ul>
          )}
          {amen.length > 0 && (
            <>
              <h3 className="rmodal-sub">Services and amenities</h3>
              <ul className="rmodal-amen">
                {amen.map((a) => (
                  <li key={a.id}>{a.label}</li>
                ))}
              </ul>
            </>
          )}
          <p className="rmodal-rate">{r.rate ? `From ${rupees(r.rate)} a night. Final rate depends on your dates.` : 'Rates on request, confirmed with your dates.'}</p>
        </div>
        <div className="rmodal-actions">
          <Link href={enquire(r)} className="btn solid">
            Check availability
          </Link>
          <Link href={`/rooms/${r.id}`} className="btn outline dark">
            View room page
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
