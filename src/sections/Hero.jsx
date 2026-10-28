import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SmartImg from '../components/SmartImg';
import { EASE, Eyebrow, MaskLines } from '../components/Motion';
import { whatsappUrl } from '../lib/enquiry';
import { ChatIcon } from '../components/Icons';

const SLIDES = ['roomDeluxe', 'vivekananda', 'front', 'sunset', 'thiruvalluvar'];
const DURATION = 6500;

export default function Hero() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 500], [0, -60]); // #7
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const zoom = useTransform(scrollY, [0, 700], [1, 1.1]); // #8

  useEffect(() => {
    if (reduce) return undefined;
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [i, reduce]);

  return (
    <section className="hero" aria-label="Welcome">
      <motion.div style={{ position: 'absolute', inset: 0, scale: reduce ? 1 : zoom }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={SLIDES[i]}
            className="hero-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {/* #1 sunrise settle: 108% -> 100%. The first image is visible immediately (no opacity fade on load). */}
            <motion.div
              style={{ width: '100%', height: '100%' }}
              initial={{ scale: reduce ? 1 : 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: DURATION / 1000 + 1.2, ease: EASE }}
            >
              <SmartImg name={SLIDES[i]} eager={i === 0} style={{ width: '100%', height: '100%' }} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* #4 horizon glow bloom */}
      <motion.div className="hero-glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 0.3 }} />

      <motion.div className="hero-content" style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
        <div className="container">
          <Eyebrow onMount delay={0.2}>
            East Car Street · Kanyakumari
          </Eyebrow>
          <MaskLines as="h1" lines={['Sunrise over', 'the sea, from', 'your room']} animateOnMount delay={0.35} />
          <motion.p className="lead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.75 }}>
            Sea-view rooms looking towards the Vivekananda Rock Memorial and Thiruvalluvar Statue, a short walk from the beach.
          </motion.p>
          {/* #3 delayed CTA entrance */}
          <motion.div className="cta-row" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.95 }}>
            <a href="#enquire" className="btn solid light">
              Check availability
            </a>
            <a href={whatsappUrl()} className="btn solid wa" target="_blank" rel="noreferrer">
              <ChatIcon /> WhatsApp us
            </a>
          </motion.div>
        </div>
      </motion.div>

      <div className="hero-dots" role="tablist" aria-label="Hero photos">
        {SLIDES.map((s, k) => (
          <button key={s} role="tab" aria-selected={k === i} aria-label={`Photo ${k + 1}`} onClick={() => setI(k)}>
            {k === i ? (
              <motion.span key={`p${i}`} initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: 1 }} transition={{ duration: DURATION / 1000, ease: 'linear' }} />
            ) : (
              <span style={{ transform: `scaleX(${k < i ? 1 : 0})` }} />
            )}
          </button>
        ))}
      </div>
      <a href="#about" className="scroll-cue" aria-label="Scroll to explore">
        <i />
      </a>
    </section>
  );
}
