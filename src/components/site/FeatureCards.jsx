'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { AMENITIES, VIDEO } from '@/data/content';
import { FacilityIcon } from '../Icons';
import { EASE } from './ui';

// "Hotel amenities and features" (from the original site, rebuilt): text and a pulsing play button on the
// left that opens the room tour on its own page; four cards on the right that turn Deep Teal on hover.
export default function FeatureCards() {
  const reduce = useReducedMotion();
  return (
    <section className="sec feat" aria-labelledby="feat-h">
      <svg className="feat-skyline" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220V150h60v-40h40v60h50V90h70v80h40v-50h60v100h30V60h80v160h40v-70h50v70h60V100h50v120h40V130h70v90h50V80h60v140h40v-60h60v60h50V120h70v100z" />
      </svg>
      <div className="container wide feat-grid">
        <motion.div className="feat-copy" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: EASE }}>
          <span className="tag-line">Why stay with us</span>
          <h2 id="feat-h" className="sec-title">Hotel amenities and features</h2>
          <p className="lead">Thoughtful service and practical comforts close to the sea, from the conference hall to the Wave Bar.</p>
          <Link href="/room-tour" className="feat-play" aria-label={`Watch the room tour video (${VIDEO.duration}), opens the video page`}>
            <span className="feat-play-btn">
              {!reduce && <span className="feat-ring" aria-hidden="true" />}
              {!reduce && <span className="feat-ring r2" aria-hidden="true" />}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <svg className="feat-arrow" viewBox="0 0 120 60" aria-hidden="true">
              <motion.path d="M6 8c30 0 52 10 66 30 6 9 14 13 26 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE, delay: 0.5 }} />
              <path d="M92 44l8 7-9 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="feat-play-text">
              <b>Watch the room tour</b>
              <small>{VIDEO.duration} video</small>
            </span>
          </Link>
        </motion.div>
        <div className="feat-cards">
          {AMENITIES.map((a, i) => (
            <motion.div key={a.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}>
              <Link href={a.link} className="feat-card">
                <span className="feat-icon">
                  <FacilityIcon name={a.icon} i={i} />
                </span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <span className="feat-more" aria-hidden="true">
                  Explore →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
