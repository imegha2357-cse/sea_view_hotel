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
  instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
    </svg>
  ),
  x: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.3l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.9zM16.7 19.2h1.7L7.2 4.7H5.4z" />
    </svg>
  ),
  google: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a4 4 0 0 1-1.7 2.6v2.1h2.8c1.6-1.5 2.4-3.7 2.4-6.3z M12 20.5c2.3 0 4.2-.8 5.6-2l-2.8-2.1c-.8.5-1.7.8-2.8.8a5 5 0 0 1-4.7-3.4H4.4v2.2A8.5 8.5 0 0 0 12 20.5z M7.3 13.8a5 5 0 0 1 0-3.2V8.4H4.4a8.5 8.5 0 0 0 0 7.6z M12 6.8c1.2 0 2.3.4 3.2 1.2l2.4-2.4A8.5 8.5 0 0 0 4.4 8.4l2.9 2.2A5 5 0 0 1 12 6.8z" />
    </svg>
  ),
};
