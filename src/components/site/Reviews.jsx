'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Fragment, useRef } from 'react';
import { GOOGLE_REVIEW_URL, HOTEL, TESTIMONIALS, mapsLink } from '@/data/content';
import { EASE, Icon } from './ui';
import Photo from '../Photo';

// PRD WS-09: only approved, attributed guest quotes are shown. Until the hotel approves some,
// the section points to where real reviews already live, and never invents ratings or quotes.
const WAYS = [
  {
    k: 'fb',
    title: 'Guest posts on Facebook',
    text: 'Photos and posts shared by guests and the hotel on our Facebook page.',
    href: HOTEL.facebook,
    cta: 'Open Facebook',
    icon: 'facebook',
  },
  {
    k: 'google',
    title: GOOGLE_REVIEW_URL ? 'Reviews on Google' : 'Find us on Google Maps',
    text: 'Read what travellers say and see their photos on our Google listing.',
    href: GOOGLE_REVIEW_URL || mapsLink,
    cta: GOOGLE_REVIEW_URL ? 'Read reviews' : 'Open Google Maps',
    icon: 'pin',
  },
  {
    k: 'wa',
    title: 'Tell us about your stay',
    text: 'Stayed with us? Send your feedback straight to our team on WhatsApp.',
    href: `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(`Hello ${HOTEL.name}, here is my feedback about my stay: `)}`,
    cta: 'Share feedback',
    icon: 'chat',
  },
];

const WORDS = ['Stories', 'from', 'the', 'shore'];

export default function Reviews({ items = [], reviewLink = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%']);
  const list = items.length ? items.map((t) => ({ quote: t.text, name: t.name, from: t.place, date: t.date ? new Date(t.date + 'T00:00:00Z').toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : '', source: t.source })) : TESTIMONIALS;
  const stagger = (i) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, transition: { duration: 0.7, ease: EASE, delay: i * 0.12 } });

  return (
    <section ref={ref} className="sec rv" id="reviews" aria-labelledby="reviews-h">
      <motion.div className="rv-bg" style={{ y }} aria-hidden="true">
        <Photo k="sunset" sizes="100vw" alt="" quality={50} />
      </motion.div>
      <div className="container wide rv-grid">
        <div className="rv-intro">
          <motion.svg className="rv-quote" viewBox="0 0 64 48" aria-hidden="true" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <motion.path d="M26 6C14 10 6 19 6 30a10 10 0 1 0 10-10 M58 6C46 10 38 19 38 30a10 10 0 1 0 10-10" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE }} />
          </motion.svg>
          <motion.p className="rv-k" {...stagger(0)}>
            Guest reviews
          </motion.p>
          <h2 id="reviews-h" className="rv-title">
            {WORDS.map((w, i) => (
              <Fragment key={w}>
                <motion.span initial={{ opacity: 0, y: '0.6em' }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.09 }}>
                  {i === WORDS.length - 1 ? <em>{w}</em> : w}
                </motion.span>{' '}
              </Fragment>
            ))}
          </h2>
          <motion.p className="rv-lead" {...stagger(2)}>
            Guests come for the sunrise over three seas and the view of the island memorials. Read their posts, see their photos, or tell us about your own stay.
          </motion.p>
        </div>

        {list.length > 0 ? (
          <div className="rv-cards">
            {list.slice(0, 6).map((t, i) => (
              <motion.figure key={`${t.name}-${i}`} className="rv-card rv-quote-card" {...stagger(i)}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <b>{t.name}</b>
                  <span>{[t.from, t.date, t.source].filter(Boolean).join(' · ')}</span>
                </figcaption>
              </motion.figure>
            ))}
            {reviewLink && (
              <a className="rv-write" href={reviewLink} target="_blank" rel="noopener noreferrer">
                Stayed with us? Write a review <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        ) : (
          <ul className="rv-cards" role="list">
            {WAYS.map((w, i) => {
              const I = Icon[w.icon];
              return (
                <motion.li key={w.k} {...stagger(i + 1)}>
                  <a className="rv-card" href={w.href} target="_blank" rel="noreferrer">
                    <span className="rv-icon">
                      <I />
                    </span>
                    <span className="rv-body">
                      <b>{w.title}</b>
                      <span>{w.text}</span>
                    </span>
                    <span className="rv-go">
                      {w.cta} <span aria-hidden="true">→</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
