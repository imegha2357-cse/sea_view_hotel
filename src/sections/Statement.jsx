import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SmartImg from '../components/SmartImg';
import { Eyebrow } from '../components/Motion';

// #28 words brighten one by one as the statement scrolls past, with small photos set into the line.
const PARTS = [
  'Wake',
  'to',
  'the',
  'first',
  'light',
  { img: 'vivekananda' },
  'over',
  'three',
  'seas,',
  'a',
  'short',
  'walk',
  'from',
  { img: 'beach' },
  'the',
  'shore',
  'and',
  'the',
  'ferry',
  'to',
  'Vivekananda',
  'Rock.',
];

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

function Pill({ name, progress, range }) {
  const width = useTransform(progress, range, ['0em', '2.6em']);
  return (
    <motion.span className="pill-img" style={{ width }} aria-hidden="true">
      <SmartImg name={name} width={480} sizes="160px" />
    </motion.span>
  );
}

export default function Statement() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const n = PARTS.length;
  const text = PARTS.filter((p) => typeof p === 'string').join(' ');

  return (
    <section className="section statement" id="story">
      <div className="container">
        <Eyebrow>At the tip of India</Eyebrow>
        <p className="statement-text" ref={ref} aria-label={text}>
          <span aria-hidden="true">
            {PARTS.map((p, i) => {
              const range = [i / n, Math.min(1, (i + 1.5) / n)];
              if (typeof p !== 'string') return reduce ? null : <Pill key={i} name={p.img} progress={scrollYProgress} range={range} />;
              return reduce ? <span key={i}>{p} </span> : <Word key={i} progress={scrollYProgress} range={range}>{p}</Word>;
            })}
          </span>
        </p>
      </div>
    </section>
  );
}
