'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HERO_SLIDES, HOTEL } from '@/data/content';
import Photo from '../Photo';
import Lightbox from './Lightbox';
import { EASE, KenBurns } from './ui';
import { HeroIcon } from './HeroIcons';

const DELAY = 7000;

// Facts along the bottom of the hero, all published by the hotel.
export const HERO_FEATURES = [
  { icon: 'waves', title: 'Sea-facing rooms', text: 'Views to the island memorials' },
  { icon: 'sunrise', title: 'Sunrise from your room', text: 'Over the sea at the tip of India' },
  { icon: 'dish', title: 'Multi-cuisine restaurant', text: 'Indian, Chinese and Continental' },
  { icon: 'bell', title: '24-hour room service', text: 'Day and night' },
  { icon: 'parking', title: 'Free parking', text: 'For hotel guests' },
  { icon: 'compass', title: 'Travel desk', text: 'Sightseeing and tours' },
];

const rise = (d) => ({ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: d } } });

export default function Hero({ slides = HERO_SLIDES, gallery }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [lb, setLb] = useState(null);
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const n = slides.length;
  const go = useCallback((d) => setI((x) => (x + d + n) % n), [n]);

  // Gentle parallax: the text drifts up and fades as the hero scrolls away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (!playing || hover || reduce || n < 2) return undefined;
    const t = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(t);
  }, [i, playing, hover, reduce, go, n]);

  const s = slides[i];
  return (
    <section ref={ref} className="hero coast" data-hero aria-label="Welcome to Hotel Sea View" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {/* The previous, current and next photos stay mounted: the old one fades out while the next is already loaded. */}
      {slides.map((x, k) =>
        k === i || k === (i + 1) % n || k === (i - 1 + n) % n ? (
          <motion.div key={x.image} className="hero-slide" initial={false} animate={{ opacity: k === i ? 1 : 0 }} style={{ zIndex: k === i ? 1 : 0 }} transition={{ duration: 1.4, ease: 'easeInOut' }} aria-hidden={k !== i}>
            <KenBurns duration={DELAY / 1000 + 3} active={k === i}>
              <Photo k={x.image} sizes="(orientation: portrait) 240vh, 100vw" priority={k === 0} alt={k === i ? x.caption : ''} />
            </KenBurns>
          </motion.div>
        ) : null
      )}

      <motion.div className="container hero-copy" style={reduce ? undefined : { y: textY, opacity: textO }} initial="hidden" animate="show">
        <motion.p className="hero-chip" variants={rise(0.15)}>
          <i aria-hidden="true" /> East Car Street · Kanyakumari
        </motion.p>
        <motion.h1 className="hero-h1" variants={rise(0.3)}>
          Wake up to the <em>sunrise</em>
          <br /> at the tip of India.
        </motion.h1>
        <motion.p className="hero-sub" variants={rise(0.45)}>
          Sea-facing rooms looking out to the Vivekananda Rock Memorial and the Thiruvalluvar Statue, a short walk from Kanyakumari beach.
        </motion.p>
        <motion.div className="hero-ctas" variants={rise(0.6)}>
          <Link href="/enquire" className="cta-pill accent">
            Check availability <span aria-hidden="true">→</span>
          </Link>
          <Link href="/rooms" className="cta-pill glass">
            Explore rooms
          </Link>
          <a href={`https://wa.me/${HOTEL.whatsapp}`} className="cta-pill wa" target="_blank" rel="noreferrer">
            <HeroIcon name="chat" /> WhatsApp us
          </a>
        </motion.div>
        <motion.p className="hero-note" variants={rise(0.7)}>
          We confirm availability and price personally, by phone or WhatsApp.
        </motion.p>
      </motion.div>

      <div className="hero-foot container">
        <motion.ul className="hero-strip" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.85 }} aria-label="At a glance">
          {HERO_FEATURES.map((f) => (
            <li key={f.title}>
              <HeroIcon name={f.icon} />
              <b>{f.title}</b>
              <span>{f.text}</span>
            </li>
          ))}
        </motion.ul>
        <div className="hero-controls">
          <span className="hero-cap" aria-live="polite">
            {s.caption}
          </span>
          <div className="hero-dots" role="group" aria-label="Choose photo">
            {slides.map((x, k) => (
              <button key={x.image} aria-label={`Photo ${k + 1}: ${x.caption}`} aria-current={k === i ? 'true' : undefined} onClick={() => setI(k)} />
            ))}
          </div>
          {n > 1 && (
            <button className="hero-pause" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the slideshow' : 'Play the slideshow'}>
              {playing ? '❚❚' : '▶'}
            </button>
          )}
          <Link href="/room-tour" className="hero-gallery hero-tour">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
            Watch room tour
          </Link>
          {gallery?.length > 0 && (
            <button className="hero-gallery" onClick={() => setLb(0)}>
              View gallery
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>{lb !== null && <Lightbox items={gallery} start={lb} onClose={() => setLb(null)} />}</AnimatePresence>
    </section>
  );
}
