'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FACILITIES, GEO, HOTEL, mapsLink } from '@/data/content';
import { sunOn } from '@/lib/sun';
import { FacilityIcon } from '../Icons';
import Photo from '../Photo';
import { Chevron, EASE } from './ui';

const ROWS = [
  { k: 'Address', v: HOTEL.addressLines.join(', '), href: mapsLink, ext: true, icon: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { k: 'Reservations and WhatsApp', v: HOTEL.phone, href: `tel:${HOTEL.phoneHref}`, copy: HOTEL.phone, icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z' },
  { k: 'Restaurant', v: HOTEL.restaurantPhone, href: `tel:${HOTEL.restaurantPhoneHref}`, copy: HOTEL.restaurantPhone, icon: 'M3 17h18 M5 17a7 7 0 0 1 14 0 M12 7V5 M10 5h4' },
  { k: 'Email', v: HOTEL.email, href: `mailto:${HOTEL.email}`, copy: HOTEL.email, icon: 'M3 5h18v14H3z M3 6l9 7 9-7' },
  { k: 'Check-in and check-out', v: HOTEL.checkIn ? `From ${HOTEL.checkIn} · by ${HOTEL.checkOut}` : 'Please ask when you enquire', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2' },
];

function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="hi-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {}
      }}
      aria-label={`Copy ${label}`}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

// "Hotel information": a teal card with the contact details (tap to call, copy, directions), today's
// sunrise from the hotel's location, and the facilities as animated tiles around a photo of the lobby.
export default function HotelInfo() {
  const reduce = useReducedMotion();
  // Worked out in the browser, so the times are always for the visitor's today (the page itself is cached).
  const [sun, setSun] = useState(null);
  useEffect(() => setSun(sunOn(GEO, new Date())), []);
  const rise = (i) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.7, ease: EASE, delay: i * 0.07 } });

  return (
    <section className="sec hi" id="facilities" aria-labelledby="info-h">
      <div className="container wide">
        <div className="hi-head">
          <motion.p className="rv-k" {...rise(0)}>
            Good to know
          </motion.p>
          <motion.h2 id="info-h" {...rise(1)}>
            Hotel <em>information</em>
          </motion.h2>
          <motion.p className="hi-lead" {...rise(2)}>
            Everything you need before you arrive: how to reach us, who to call, and what the hotel offers.
          </motion.p>
        </div>

        <div className="hi-grid">
          <motion.div className="hi-card" {...rise(1)}>
            <ul className="hi-rows">
              {ROWS.map((r, i) => (
                <motion.li key={r.k} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}>
                  <span className="hi-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d={r.icon} />
                    </svg>
                  </span>
                  <span className="hi-txt">
                    <small>{r.k}</small>
                    {r.href ? (
                      <a href={r.href} {...(r.ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
                        {r.v}
                      </a>
                    ) : (
                      <b>{r.v}</b>
                    )}
                  </span>
                  {r.copy && <CopyBtn text={r.copy} label={r.k} />}
                </motion.li>
              ))}
            </ul>
            <div className="hi-sun" aria-label="Sunrise and sunset in Kanyakumari today">
              <span>
                <small>Sunrise today</small>
                <b>{sun?.sunrise || '–'}</b>
              </span>
              <span className="hi-sun-arc" aria-hidden="true">
                <motion.span initial={{ rotate: reduce ? 0 : -80 }} whileInView={{ rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} />
              </span>
              <span>
                <small>Sunset today</small>
                <b>{sun?.sunset || '–'}</b>
              </span>
            </div>
            <div className="hi-actions">
              <Link href="/policies" className="btn solid sm ghost-light">
                Hotel policies
              </Link>
              <a href={mapsLink} className="btn outline light sm" target="_blank" rel="noreferrer">
                Get directions
              </a>
            </div>
          </motion.div>

          <div className="hi-fac" aria-labelledby="fac-h">
            <h3 id="fac-h" className="sr-only">
              Facilities
            </h3>
            <motion.div className="hi-photo frame" {...rise(2)}>
              <motion.div className="hi-photo-in" initial={{ scale: reduce ? 1 : 1.1 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: EASE }}>
                <Photo k="lobby" sizes="(max-width: 900px) 100vw, 30vw" alt="The hotel lobby" />
              </motion.div>
              <span className="hi-photo-cap">
                <b>Facilities</b>
                <span>What the hotel offers its guests</span>
              </span>
            </motion.div>
            {FACILITIES.map((f, i) => (
              <motion.div key={f.label} className="hi-tile" {...rise(i % 4)}>
                <span className="hi-tile-ico">
                  <FacilityIcon name={f.icon} i={i % 4} />
                </span>
                <b>{f.label}</b>
                {f.text && <span>{f.text}</span>}
              </motion.div>
            ))}
          </div>
        </div>
        <p className="hi-more">
          <Link href="/about" className="more-link">
            More about the hotel <Chevron />
          </Link>
        </p>
      </div>
    </section>
  );
}
