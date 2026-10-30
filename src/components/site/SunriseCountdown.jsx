'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GEO } from '@/data/content';
import { nextSunrise, sunOn } from '@/lib/sun';
import Photo from '../Photo';
import { EASE } from './ui';

const pad = (n) => String(n).padStart(2, '0');
const rise = (i) => ({ initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.7, ease: EASE, delay: i * 0.08 } });

// Live countdown to the next sunrise at Kanyakumari (calculated for the hotel's location), beside
// a real photo of the sunrise view from one of our sea-facing rooms.
export default function SunriseCountdown() {
  const [s, setS] = useState(null);
  const [today, setToday] = useState(null);
  useEffect(() => {
    const tick = () => setS(nextSunrise(GEO));
    tick();
    setToday(sunOn(GEO, new Date()));
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const h = s ? Math.floor(s.ms / 3600e3) : 0;
  const m = s ? Math.floor((s.ms % 3600e3) / 60e3) : 0;
  const sec = s ? Math.floor((s.ms % 60e3) / 1000) : 0;
  const units = [
    [h, 'Hours'],
    [m, 'Minutes'],
    [sec, 'Seconds'],
  ];
  return (
    <section className="sunc" aria-labelledby="sunc-h">
      <div className="container wide sunc-grid">
        <div className="sunc-copy">
          <motion.p className="sunc-k" {...rise(0)}>
            <span aria-hidden="true" className="sunc-rule" />
            {s ? (s.today ? "Today's sunrise" : "Tomorrow's sunrise") : 'Next sunrise'}
          </motion.p>
          <motion.h2 id="sunc-h" className="sunc-title" {...rise(1)}>
            The sun rises over three seas at <span className="sunc-at">{s?.at || '–'}</span>
          </motion.h2>
          <motion.div className="sunc-clock" role="timer" aria-label={s ? `${h} hours ${m} minutes until sunrise` : 'Time until sunrise'} {...rise(2)}>
            {units.map(([v, l]) => (
              <div key={l} className="sunc-unit">
                <b>{pad(v)}</b>
                <span>{l}</span>
              </div>
            ))}
          </motion.div>
          <motion.dl className="sunc-facts" {...rise(3)}>
            <div>
              <dt>Sunset today</dt>
              <dd>{today?.sunset || '–'}</dd>
            </div>
            <div>
              <dt>Best spot</dt>
              <dd>Your sea-facing balcony</dd>
            </div>
          </motion.dl>
          <motion.p className="sunc-note" {...rise(4)}>
            Be ready 15 minutes early: the sky over the Vivekananda Rock Memorial starts to glow well before the sun appears.
          </motion.p>
          <motion.div className="sunc-actions" {...rise(5)}>
            <Link href="/rooms#sea-view" className="btn solid sunc-btn">
              Rooms with a sunrise view
            </Link>
            <Link href="/plan-your-visit" className="sunc-link">
              Sunrise times for your dates <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
        <motion.figure className="sunc-photo" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: EASE }}>
          <div className="sunc-frame">
            <Photo k="roomCornerView" sizes="(max-width: 900px) 100vw, 46vw" alt="The sea and the Vivekananda Rock Memorial seen from a corner room at Hotel Sea View" />
          </div>
          <figcaption>The view from a Corner Deluxe room</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
