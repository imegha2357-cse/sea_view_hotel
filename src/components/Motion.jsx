'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.25 };

// #23 / #24: fade up 20 px once, with optional stagger index
export function Reveal({ as = 'div', i = 0, delay = 0, y = 20, children, className, style, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 0.7, ease: EASE, delay: delay + i * 0.08 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// #2 / #25: each line slides up from behind a mask
// The parent heading watches the viewport: a line hidden behind its mask is clipped,
// so it would never count as "in view" by itself.
export function MaskLines({ lines, as = 'h2', className, delay = 0, animateOnMount = false }) {
  const Tag = motion[as];
  const trigger = animateOnMount ? { animate: 'show' } : { whileInView: 'show', viewport: VIEW };
  return (
    <Tag className={className} initial="hide" {...trigger} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span className="mask" key={i} aria-hidden="true">
          <motion.span
            variants={{ hide: { y: '105%' }, show: { y: '0%', transition: { duration: 0.8, ease: EASE, delay: delay + i * 0.09 } } }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// #27: gold rule draws, eyebrow fades in
export function Eyebrow({ children, onMount = false, delay = 0 }) {
  const trigger = onMount ? { animate: { scaleX: 1 } } : { whileInView: { scaleX: 1 }, viewport: VIEW };
  const fade = onMount ? { animate: { opacity: 1 } } : { whileInView: { opacity: 1 }, viewport: VIEW };
  return (
    <span className="eyebrow">
      <motion.i className="rule" initial={{ scaleX: 0 }} {...trigger} transition={{ duration: 0.6, ease: EASE, delay }} />
      <motion.span initial={{ opacity: 0 }} {...fade} transition={{ duration: 0.5, delay: delay + 0.3 }}>
        {children}
      </motion.span>
    </span>
  );
}

export function SectionHeading({ eyebrow, title, text, center, titleLines }) {
  return (
    <div className={`sh ${center ? 'center' : ''}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <MaskLines lines={titleLines || [title]} />
      {text && (
        <Reveal as="p" delay={0.2}>
          {text}
        </Reveal>
      )}
    </div>
  );
}

// #37 / #38: frame opens from the bottom while the photo inside settles from 115% to 100%
export function CurtainReveal({ children, className, style, delay = 0 }) {
  // The outer box watches the viewport; a clipped element would never register as visible.
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} style={style} initial={reduce ? false : 'hide'} whileInView="show" viewport={VIEW}>
      <motion.div
        className="reveal-frame"
        style={{ width: '100%', height: '100%' }}
        variants={{
          hide: { clipPath: 'inset(100% 0% 0% 0%)' },
          show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.9, ease: EASE, delay } },
        }}
      >
        <motion.div
          style={{ width: '100%', height: '100%' }}
          variants={{ hide: { scale: 1.15 }, show: { scale: 1, transition: { duration: 1.3, ease: EASE, delay } } }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// #26: slow drifting wave line between sections
export function WaveDivider({ color }) {
  const reduce = useReducedMotion();
  return (
    <div className="wave-divider" style={color ? { color } : undefined} aria-hidden="true">
      <motion.svg
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
      >
        <path d="M0 12 Q25 3 50 12 T100 12 T150 12 T200 12 T250 12 T300 12 T350 12 T400 12" />
      </motion.svg>
    </div>
  );
}

// Big statements: each word rises with a stagger when the line enters view.
export function SplitWords({ text, as = 'h2', className, delay = 0, onMount = false, ready = true }) {
  const Tag = motion[as];
  const words = text.split(' ');
  const trigger = onMount ? { animate: ready ? 'show' : 'hide' } : { whileInView: 'show', viewport: VIEW };
  return (
    <Tag className={className} initial="hide" {...trigger} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="mask word" aria-hidden="true">
            <motion.span variants={{ hide: { y: '110%', rotate: 4 }, show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: EASE, delay: delay + i * 0.06 } } }}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

// Buttons drift a few pixels toward the pointer (desktop only).
export function Magnetic({ children, strength = 0.25, className }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const move = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <motion.span className={`magnetic ${className || ''}`} style={{ x: sx, y: sy }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.span>
  );
}

// Verified numbers roll up once when they come into view.
export function CountUp({ to, duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / (duration * 1000));
      setN(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);
  return <span ref={ref}>{n}</span>;
}
