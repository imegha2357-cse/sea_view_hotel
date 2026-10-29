'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { ATTRACTIONS, HOTEL, HOW_TO_REACH, mapsEmbed, mapsLink } from '@/data/content';
import Photo from '../Photo';
import { EASE, Icon } from './ui';

const MODE_ICON = {
  'By train': 'M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z M4 11h16 M8 15h.01 M16 15h.01 M8 21l2-3 M16 21l-2-3',
  'By bus': 'M5 4h14a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1z M4 11h16 M7 20v-3 M17 20v-3 M8 14.5h.01 M16 14.5h.01',
  'By air': 'M10.5 21l1.5-1v-5l8 2.5V15l-8-5V4.5a1.5 1.5 0 0 0-3 0V10l-8 5v2.5L9 15v5l1.5 1z',
  'By road': 'M5 16l1.5-6h11L19 16 M3 16h18v3H3z M7 19v2 M17 19v2 M7.5 13.5h.01 M16.5 13.5h.01',
};

// Location: a photo card with the address and a map that loads on request, and "How to reach"
// as icon tabs. Nearby landmarks float in as chips. Distances are not stated until verified.
export default function LocationSection() {
  const [i, setI] = useState(0);
  const [map, setMap] = useState(false);
  const reduce = useReducedMotion();
  const rise = (d = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.7, ease: EASE, delay: d } });

  return (
    <section className="sec loc2" id="location" aria-labelledby="loc-h">
      <div className="container wide loc2-grid">
        <div className="loc2-text">
          <motion.p className="loc2-k" {...rise(0)}>
            Location
          </motion.p>
          <motion.h2 id="loc-h" {...rise(0.08)}>
            At the tip of <em>India</em>
          </motion.h2>
          <motion.p className="loc2-lead" {...rise(0.16)}>
            On East Car Street in the heart of Kanyakumari, close to the beach where three seas meet and a few minutes from the bus terminus.
          </motion.p>

          <motion.address className="loc2-addr" {...rise(0.22)}>
            <span className="loc2-addr-icon" aria-hidden="true">
              <Icon.pin />
            </span>
            <span>
              <b>{HOTEL.name}</b>
              {HOTEL.addressLines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </motion.address>

          <motion.div {...rise(0.3)}>
            <p className="loc2-sub" id="reach-h">
              How to reach us
            </p>
            <div className="loc2-tabs" role="tablist" aria-labelledby="reach-h">
              {HOW_TO_REACH.map((h, k) => (
                <button key={h.mode} type="button" role="tab" id={`reach-t-${k}`} aria-selected={i === k} aria-controls="reach-panel" className={i === k ? 'on' : ''} onClick={() => setI(k)}>
                  {i === k && <motion.span layoutId="reach-pill" className="loc2-tab-bg" transition={{ duration: 0.35, ease: EASE }} />}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={MODE_ICON[h.mode] || MODE_ICON['By road']} />
                  </svg>
                  <span>{h.mode.replace('By ', '').replace(/^./, (c) => c.toUpperCase())}</span>
                </button>
              ))}
            </div>
            <div className="loc2-panel" id="reach-panel" role="tabpanel" aria-labelledby={`reach-t-${i}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3, ease: EASE }}>
                  {HOW_TO_REACH[i].text}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div className="loc2-actions" {...rise(0.38)}>
            <a href={mapsLink} className="btn solid" target="_blank" rel="noreferrer">
              Get directions
            </a>
            <a href={`tel:${HOTEL.phoneHref}`} className="btn outline dark">
              Call {HOTEL.phone}
            </a>
            <Link href="/plan-your-visit#reach" className="more-link">
              Travel tips
            </Link>
          </motion.div>
        </div>

        <motion.div className="loc2-visual" {...rise(0.1)}>
          {map ? (
            <iframe title={`Map showing ${HOTEL.name}`} src={mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <>
              <motion.div className="loc2-photo" initial={{ scale: reduce ? 1 : 1.12 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 2.4, ease: EASE }}>
                <Photo k="building" sizes="(max-width: 900px) 100vw, 50vw" alt="Hotel Sea View on East Car Street, Kanyakumari" />
              </motion.div>
              <div className="loc2-shade" aria-hidden="true" />
              <div className="loc2-card">
                <span className="loc2-pin" aria-hidden="true">
                  <Icon.pin />
                </span>
                <ul className="loc2-chips" aria-label="Nearby landmarks">
                {ATTRACTIONS.slice(0, 4).map((a, k) => (
                  <motion.li key={a.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: 0.5 + k * 0.12 }}>
                    {a.name}
                  </motion.li>
                ))}
                </ul>
                <b>East Car Street, Kanyakumari</b>
                <span>Tamil Nadu 629 702</span>
                <button type="button" className="btn solid sm ghost-light" onClick={() => setMap(true)}>
                  Show the map
                </button>
                <small>The map is provided by Google and loads only when you ask.</small>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
