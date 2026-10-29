'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

export const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.2 };

// Fade-up on scroll (Taj sections rise gently into place).
export function Reveal({ as = 'div', i = 0, delay = 0, y = 28, children, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.08 }} {...rest}>
      {children}
    </Tag>
  );
}

// Heading with the short gold rule that draws in from the left ("— OUR ROOMS").
export function LineTitle({ as = 'h2', children, center = false, id, className = '' }) {
  const Tag = motion[as];
  return (
    <Tag id={id} className={`sec-title ${center ? 'center' : ''} ${className}`} initial="hide" whileInView="show" viewport={VIEW}>
      <motion.span className="line" aria-hidden="true" variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } } }} />
      <motion.span variants={{ hide: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE, delay: 0.15 } } }}>{children}</motion.span>
    </Tag>
  );
}

// Slow zoom on a photo while it is on screen (hero and banners).
export function KenBurns({ children, active = true, duration = 9 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className="kb" initial={{ scale: 1.12 }} animate={{ scale: active && !reduce ? 1 : 1.04 }} transition={{ duration: reduce ? 0 : duration, ease: 'linear' }}>
      {children}
    </motion.div>
  );
}

// Text that shows a few lines, then "Read more" (Taj overview).
export function ReadMore({ short, more = [], label = 'Read more' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overview-text">
      <p className="lead">
        {short}
        {!open && more.length > 0 && <span aria-hidden="true"> …</span>}
      </p>
      {more.length > 0 && (
        <>
          <motion.div className="readmore-more" initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0, marginTop: open ? 14 : 0 }} transition={{ duration: 0.5, ease: EASE }} aria-hidden={!open} id="overview-more">
            {more.map((p) => (
              <p className="lead" key={p.slice(0, 24)}>
                {p}
              </p>
            ))}
          </motion.div>
          <button type="button" className="more-link" style={{ marginTop: 16 }} aria-expanded={open} aria-controls="overview-more" onClick={() => setOpen((o) => !o)}>
            {open ? 'Read less' : label} <Chevron dir={open ? 'up' : 'right'} />
          </button>
        </>
      )}
    </div>
  );
}

export function Chevron({ dir = 'right' }) {
  const rot = { right: 0, down: 90, left: 180, up: -90 }[dir];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }} aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export const Icon = {
  user: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
  share: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M14 5l6 6-6 6M20 11H10a6 6 0 0 0-6 6v2" />
    </svg>
  ),
  chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" />
      <path d="M8 11h8M8 14.5h5" />
    </svg>
  ),
  up: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 15l6-6 6 6" />
    </svg>
  ),
  facebook: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4A21 21 0 0 0 14.4 4.3c-2.2 0-3.8 1.4-3.8 3.9v2.3H8.1v3h2.5V21h2.9z" />
    </svg>
  ),
  pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
};
