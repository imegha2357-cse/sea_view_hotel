'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { GEO } from '@/data/content';
import { nextSunrise } from '@/lib/sun';
import { EASE } from './ui';

const pad = (n) => String(n).padStart(2, '0');

// Live countdown to the next sunrise at Kanyakumari, with an animated sun rising over the sea.
// Times are calculated (NOAA formula) for the hotel's location, so it is always accurate.
export default function SunriseCountdown() {
  const [s, setS] = useState(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const tick = () => setS(nextSunrise(GEO));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const h = s ? Math.floor(s.ms / 3600e3) : 0;
  const m = s ? Math.floor((s.ms % 3600e3) / 60e3) : 0;
  const sec = s ? Math.floor((s.ms % 60e3) / 1000) : 0;
  return (
    <section className={`sunc ${s?.isDay ? 'day' : 'night'}`} aria-labelledby="sunc-h">
      <svg className="sunc-art" viewBox="0 0 400 160" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="sunc-g" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6D9A8" />
            <stop offset="100%" stopColor="#B58A55" />
          </radialGradient>
        </defs>
        <motion.circle cx="200" cy="120" r="34" fill="url(#sunc-g)" initial={{ cy: 170 }} whileInView={{ cy: 112 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 2.4, ease: EASE }} />
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M0 ${128 + i * 10} Q 50 ${122 + i * 10} 100 ${128 + i * 10} T 200 ${128 + i * 10} T 300 ${128 + i * 10} T 400 ${128 + i * 10} V160 H0Z`}
            fill={['#2a5856', '#21494a', '#173B3A'][i]}
            animate={reduce ? undefined : { x: [0, i % 2 ? 12 : -12, 0] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>
      <div className="container sunc-body">
        <p className="sunc-k">{s ? (s.today ? "Today's sunrise" : "Tomorrow's sunrise") : 'Next sunrise'} at Kanyakumari</p>
        <h2 id="sunc-h" className="sunc-at">{s?.at || '—'}</h2>
        <p className="sunc-clock" aria-live="off">
          <span>
            <b>{pad(h)}</b>hours
          </span>
          <span>
            <b>{pad(m)}</b>min
          </span>
          <span>
            <b>{pad(sec)}</b>sec
          </span>
        </p>
        <p className="sunc-note">Be on the beach or your sea-facing balcony 15 minutes early; the sky starts glowing well before the sun appears.</p>
        <a className="btn solid" href="/rooms#sea-view">
          Rooms with a sunrise view
        </a>
      </div>
    </section>
  );
}
