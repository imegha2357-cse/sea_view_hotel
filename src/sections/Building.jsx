import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ABOUT, FACTS } from '../data/content';
import SmartImg from '../components/SmartImg';
import { CountUp, Reveal, SplitWords } from '../components/Motion';

// The hotel photo opens from a framed card to full width as the visitor scrolls (scroll-linked clip reveal).
export default function Building() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const inset = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const clip = useTransform([inset, radius], ([i, r]) => `inset(${i}% ${i}% ${i}% ${i}% round ${r}px)`);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

  return (
    <section className="building" id="about">
      <div className="building-frame" ref={ref}>
        <motion.div className="building-clip" style={reduce ? undefined : { clipPath: clip }}>
          <motion.div className="building-img" style={reduce ? undefined : { scale: imgScale }}>
            <SmartImg name="building" sizes="100vw" width={1920} />
          </motion.div>
          <motion.p className="building-caption" style={reduce ? undefined : { opacity: captionOpacity }}>
            Hotel Sea View · East Car Street, Kanyakumari
          </motion.p>
        </motion.div>
      </div>

      <div className="container building-copy">
        <div>
          <SplitWords text="A family-run hotel by the sea, close to everything you came to see." className="building-title" />
        </div>
        <div className="building-text">
          {ABOUT.body.map((p, i) => (
            <Reveal as="p" key={i} i={i}>
              {p}
            </Reveal>
          ))}
          <div className="facts">
            {FACTS.map((f, i) => (
              <Reveal key={f.label} i={i} className="fact">
                <b>
                  <CountUp to={f.value} />
                </b>
                <span>{f.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
