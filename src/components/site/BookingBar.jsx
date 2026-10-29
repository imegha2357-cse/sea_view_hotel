'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ROOM_TYPES } from '@/data/content';
import { todayISO } from '@/lib/enquiry';
import { EASE } from './ui';

const plus = (iso, n) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function Step({ label, hint, value, set, min, max }) {
  return (
    <div className="row">
      <span>
        {label}
        {hint && <small style={{ display: 'block', color: 'var(--muted)', fontSize: 12 }}>{hint}</small>}
      </span>
      <span className="ctrl">
        <button type="button" onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          −
        </button>
        <b aria-live="polite">{value}</b>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </span>
    </div>
  );
}

// Taj booking bar: dates, guests and rooms, room type, Book now. It opens the enquiry form already filled in.
export default function BookingBar({ compact = false }) {
  const router = useRouter();
  const [inD, setIn] = useState('');
  const [outD, setOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [room, setRoom] = useState('');
  const [pop, setPop] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    const t = todayISO();
    setIn(plus(t, 1));
    setOut(plus(t, 2));
  }, []);
  useEffect(() => {
    if (!pop) return undefined;
    const out = (e) => !popRef.current?.contains(e.target) && setPop(false);
    const k = (e) => e.key === 'Escape' && setPop(false);
    document.addEventListener('pointerdown', out);
    window.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('pointerdown', out);
      window.removeEventListener('keydown', k);
    };
  }, [pop]);

  const submit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams({ check_in: inD, check_out: outD, adults: String(adults), children: String(children) });
    if (room) q.set('room_type', room);
    if (rooms > 1) q.set('rooms', String(rooms));
    router.push(`/enquire?${q.toString()}`);
  };

  return (
    <form className={`book-bar ${compact ? 'compact' : ''}`} onSubmit={submit} aria-label="Check availability">
      <div className="bb-cell">
        <span className="bb-label" id="bb-hotel">
          Hotel
        </span>
        <span style={{ fontSize: 15 }}>Hotel Sea View, Kanyakumari</span>
      </div>
      <div className="bb-cell dates">
        <span className="bb-label">Check-in — Check-out</span>
        <div className="bb-dates">
          <label className="sr-only" htmlFor="bb-in">
            Check-in date
          </label>
          <input
            id="bb-in"
            type="date"
            min={todayISO()}
            value={inD}
            onChange={(e) => {
              setIn(e.target.value);
              if (outD <= e.target.value) setOut(plus(e.target.value, 1));
            }}
          />
          <span aria-hidden="true">—</span>
          <label className="sr-only" htmlFor="bb-out">
            Check-out date
          </label>
          <input id="bb-out" type="date" min={inD ? plus(inD, 1) : todayISO()} value={outD} onChange={(e) => setOut(e.target.value)} />
        </div>
      </div>
      <div className="bb-cell" ref={popRef}>
        <span className="bb-label" id="bb-guests-l">
          Guests and rooms
        </span>
        <button type="button" className="bb-value" aria-haspopup="dialog" aria-expanded={pop} aria-labelledby="bb-guests-l bb-guests-v" id="bb-guests-v" onClick={() => setPop((p) => !p)}>
          {adults + children} {adults + children === 1 ? 'Guest' : 'Guests'} — {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
        </button>
        <AnimatePresence>
          {pop && (
            <motion.div className="bb-pop" role="dialog" aria-label="Guests and rooms" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <Step label="Adults" hint="Age 6+" value={adults} set={setAdults} min={1} max={12} />
              <Step label="Children" hint="Under 6" value={children} set={setChildren} min={0} max={8} />
              <Step label="Rooms" value={rooms} set={setRooms} min={1} max={6} />
              <button type="button" className="btn solid sm" onClick={() => setPop(false)}>
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="bb-cell">
        <label className="bb-label" htmlFor="bb-room">
          Room type
        </label>
        <select id="bb-room" value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Any room</option>
          {ROOM_TYPES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <button className="btn solid" type="submit">
        Book now
      </button>
    </form>
  );
}
