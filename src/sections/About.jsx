import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { ABOUT } from '../data/content';
import SmartImg from '../components/SmartImg';
import { CurtainReveal, Eyebrow, MaskLines, Reveal } from '../components/Motion';

export default function About() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const insetY = useTransform(scrollYProgress, [0, 1], [40, -40]); // #44 layered parallax

  return (
    <section className="section" id="about" ref={ref}>
      <div className="container about-grid">
        <div className="about-copy">
          <Eyebrow>{ABOUT.eyebrow}</Eyebrow>
          <MaskLines lines={['Sunrise over the sea,', 'from the heart of', 'Kanyakumari']} className="" />
          {ABOUT.body.map((p, i) => (
            <Reveal as="p" key={i} i={i} delay={0.2}>
              {p}
            </Reveal>
          ))}
          <div className="highlights">
            {ABOUT.highlights.map((h, i) => (
              <Reveal key={h.title} i={i} delay={0.3}>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="about-media">
          <CurtainReveal className="main">
            <SmartImg name="front" style={{ width: '100%', height: '100%' }} />
          </CurtainReveal>
          <motion.div className="inset" style={reduce ? undefined : { y: insetY }}>
            <CurtainReveal delay={0.25} style={{ width: '100%', height: '100%' }}>
              <SmartImg name="roomCorner" style={{ width: '100%', height: '100%' }} />
            </CurtainReveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
