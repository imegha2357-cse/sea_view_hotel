'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HOTEL } from '@/data/content';
import Photo from '../Photo';
import { EASE } from './ui';

const ICONS = {
  sun: 'M12 4V2 M12 22v-2 M4.9 4.9 3.5 3.5 M20.5 20.5l-1.4-1.4 M4 12H2 M22 12h-2 M4.9 19.1l-1.4 1.4 M20.5 3.5l-1.4 1.4 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  bell: 'M4 18h16 M6 18a6 6 0 0 1 12 0 M12 12V10 M10 10h4 M3 21h18',
  car: 'M5 16V11l2-5h10l2 5v5 M5 16h14 M5 16v2 M19 16v2 M7.5 13.5h.01 M16.5 13.5h.01',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z M9 4v14 M15 6v14',
};
const DEFAULT_ITEMS = [
  ['sun', 'Sunrise sea views'],
  ['bell', '24-hour room service'],
  ['car', 'Free parking'],
  ['map', 'Travel desk'],
];
const rise = (i) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, transition: { duration: 0.8, ease: EASE, delay: i * 0.1 } });

// Full-width photo band: the photo stays still while the page scrolls over it (pinned with
// clip-path + position: fixed, which also works on phones), a headline on the left and a framed
// panel of services on the right.
export default function ServiceBand({ image = 'frontNight', kicker = 'East Car Street, Kanyakumari', title = 'Comfort by the sea, a short walk from the shore', panelTitle = 'Personalised services', items = DEFAULT_ITEMS, alt = 'Hotel Sea View entrance at night' }) {
  const wa = `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(`Hello ${HOTEL.name}, I would like to book a room. My dates are: `)}`;
  return (
    <section className="sband" aria-label={title}>
      <div className="sband-bg" aria-hidden="true">
        <Photo k={image} sizes="100vw" alt={alt} quality={80} />
      </div>
      <div className="sband-shade" aria-hidden="true" />
      <div className="container wide sband-grid">
        <div className="sband-copy">
          <motion.h2 className="sband-title" {...rise(0)}>
            {title}
          </motion.h2>
          <motion.p className="sband-k" {...rise(1)}>
            {kicker}
            <span className="sband-line" aria-hidden="true" />
          </motion.p>
          <motion.div {...rise(2)}>
            <Link href="/enquire" className="btn solid sband-btn">
              Check availability
            </Link>
          </motion.div>
        </div>
        <motion.div className="sband-panel" {...rise(1)}>
          <span className="sband-corner tl" aria-hidden="true" />
          <span className="sband-corner tr" aria-hidden="true" />
          <span className="sband-corner bl" aria-hidden="true" />
          <span className="sband-corner br" aria-hidden="true" />
          <h3>{panelTitle}</h3>
          <ul>
            {items.map(([icon, label]) => (
              <li key={label}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONS[icon] || ICONS.sun} />
                </svg>
                {label}
              </li>
            ))}
          </ul>
          <a className="sband-book" href={wa} target="_blank" rel="noopener noreferrer">
            Book on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
