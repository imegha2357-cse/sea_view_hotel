import { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { ATTRACTIONS } from '../data/content';

// #36 landmark marquee that speeds up and reverses with the visitor's scroll.
const wrap = (min, max, v) => ((((v - min) % (max - min)) + (max - min)) % (max - min)) + min;

export default function Marquee() {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const factor = useTransform(vel, [-1500, 0, 1500], [-4, 0, 4], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let move = dir.current * -1.4 * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f) * -1;
    base.set(base.get() + move);
  });

  const items = ATTRACTIONS.map((a) => a.name);
  return (
    <div className="marquee" aria-label={`Nearby: ${items.join(', ')}`}>
      <motion.div className="marquee-track" style={{ x }} aria-hidden="true">
        {[0, 1, 2, 3].map((k) => (
          <span className="marquee-set" key={k}>
            {items.map((t) => (
              <span key={t}>
                {t}
                <i className="marquee-sun" />
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
