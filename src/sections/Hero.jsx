import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EASE, Magnetic } from '../components/Motion';
import { useIntroDone } from '../components/Intro';
import { ChatIcon } from '../components/Icons';
import { GEO, VIDEO } from '../data/content';
import { sunNow } from '../lib/sun';
import { todayISO, whatsappUrl } from '../lib/enquiry';
import { scrollToId } from '../lib/scroll';

const SEAS = ['Bay of Bengal', 'Arabian Sea', 'Indian Ocean'];

// The sun's position along today's arc from sunrise to sunset: a detail only this hotel's location has.
function SunArc() {
  const [sun, setSun] = useState(() => sunNow(GEO));
  useEffect(() => {
    const t = setInterval(() => setSun(sunNow(GEO)), 60000);
    return () => clearInterval(t);
  }, []);
  const p = sun.isDay ? sun.progress : 0;
  const ang = Math.PI * (1 - p);
  const cx = 60 + 50 * Math.cos(ang);
  const cy = 56 - 44 * Math.sin(ang);
  return (
    <div className="sun-card">
      <svg viewBox="0 0 120 62" aria-hidden="true">
        <path d="M10 56 A50 44 0 0 1 110 56" className="arc" />
        <motion.path d="M10 56 A50 44 0 0 1 110 56" className="arc-done" initial={{ pathLength: 0 }} animate={{ pathLength: p }} transition={{ duration: 2, ease: EASE, delay: 0.6 }} />
        <line x1="2" y1="56" x2="118" y2="56" className="sea-line" />
        {sun.isDay && <motion.circle r="5" className="sun-dot" initial={{ cx: 10, cy: 56 }} animate={{ cx, cy }} transition={{ duration: 2, ease: EASE, delay: 0.6 }} />}
      </svg>
      <dl>
        <div>
          <dt>{sun.sunriseLabel}</dt>
          <dd>{sun.sunrise}</dd>
        </div>
        <div>
          <dt>Sunset</dt>
          <dd>{sun.sunset}</dd>
        </div>
      </dl>
    </div>
  );
}

function PlanDock({ onPrefill }) {
  const [v, setV] = useState({ check_in: '', check_out: '', adults: 2 });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    onPrefill({ ...v, adults: +v.adults });
    scrollToId('enquire');
  };
  return (
    <form className="plan-dock" onSubmit={submit} aria-label="Plan your stay">
      <p className="dock-title">Plan your stay</p>
      <div className="dock-fields">
        <label>
          <span>Check-in</span>
          <input type="date" min={todayISO()} value={v.check_in} onChange={set('check_in')} />
        </label>
        <label>
          <span>Check-out</span>
          <input type="date" min={v.check_in || todayISO()} value={v.check_out} onChange={set('check_out')} />
        </label>
        <label className="sm">
          <span>Adults</span>
          <select value={v.adults} onChange={set('adults')}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <button className="btn solid gold" type="submit">
        Check availability
      </button>
    </form>
  );
}

export default function Hero({ onPrefill }) {
  const ready = useIntroDone();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [sea, setSea] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setSea((n) => (n + 1) % SEAS.length), 2600);
    return () => clearInterval(t);
  }, [reduce]);

  const show = ready ? 'show' : 'hide';
  const title = ['Sea', 'View'];

  return (
    <section className="hero" ref={ref} aria-label="Welcome to Hotel Sea View">
      <motion.div className="hero-media" style={reduce ? undefined : { y: mediaY, scale: mediaScale }}>
        <motion.div className="hero-media-in" initial={{ scale: 1.18 }} animate={{ scale: ready ? 1 : 1.18 }} transition={{ duration: 2.4, ease: EASE }}>
          {reduce ? (
            <img src={VIDEO.loopPoster} alt="View from a sea-facing room towards Vivekananda Rock Memorial" />
          ) : (
            <video src={VIDEO.loop} poster={VIDEO.loopPoster} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
          )}
        </motion.div>
      </motion.div>
      <div className="hero-shade" />

      <motion.div className="hero-inner container" style={reduce ? undefined : { opacity: fade }}>
        <motion.p className="hero-coords" initial={{ opacity: 0, y: 12 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }} transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}>
          <span>East Car Street, Kanyakumari</span>
          <span className="dot" />
          <span>8.08° N · 77.54° E</span>
        </motion.p>

        <motion.h1 className="hero-title" style={reduce ? undefined : { y: titleY }} initial="hide" animate={show} aria-label="Hotel Sea View">
          {title.map((w, wi) => (
            <span className="hero-word" key={w} aria-hidden="true">
              {w.split('').map((c, ci) => (
                <span className="mask" key={ci}>
                  <motion.span variants={{ hide: { y: '115%' }, show: { y: '0%', transition: { duration: 1.1, ease: EASE, delay: 0.15 + wi * 0.18 + ci * 0.05 } } }}>{c}</motion.span>
                </span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.div className="hero-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 18 }} transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}>
          <p>
            Wake to the sunrise where the{' '}
            <span className="sea-rotator" aria-live="off">
              <AnimatePresence mode="wait" initial={false}>
                <motion.em key={SEAS[sea]} initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                  {SEAS[sea]}
                </motion.em>
              </AnimatePresence>
            </span>
            <br />
            meets the tip of India.
          </p>
          <div className="hero-ctas">
            <Magnetic>
              <button className="btn solid light" onClick={() => scrollToId('rooms')}>
                Explore rooms
              </button>
            </Magnetic>
            <Magnetic>
              <a href={whatsappUrl()} className="btn solid wa" target="_blank" rel="noreferrer">
                <ChatIcon /> WhatsApp us
              </a>
            </Magnetic>
          </div>
        </motion.div>

        <motion.div className="hero-bottom" initial={{ opacity: 0, y: 30 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 30 }} transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}>
          <SunArc />
          <PlanDock onPrefill={onPrefill} />
        </motion.div>
      </motion.div>

      <button className="scroll-cue" onClick={() => scrollToId('story')} aria-label="Scroll to explore">
        <i />
      </button>
    </section>
  );
}
