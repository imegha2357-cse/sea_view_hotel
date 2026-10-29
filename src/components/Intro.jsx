import { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE } from './Motion';

// #12 branded first-visit intro: letters rise, a gold horizon draws, the sun lifts, then the panel lifts away.
// Shown once per browser session; skipped for reduced motion.
const IntroContext = createContext(true);
export const useIntroDone = () => useContext(IntroContext);

const KEY = 'seaview-intro-seen';
const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return true;
  }
};

export function IntroProvider({ children }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => !reduce && !seen());
  const [done, setDone] = useState(() => reduce || seen());

  useEffect(() => {
    if (!show) return undefined;
    const t1 = setTimeout(() => setDone(true), 1650);
    const t2 = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {}
    }, 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [show]);

  const letters = 'SEA VIEW'.split('');
  return (
    <IntroContext.Provider value={done}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div className="intro" aria-hidden="true" initial={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}>
            <div className="intro-inner">
              <div className="intro-word">
                {letters.map((l, i) => (
                  <span className="mask" key={i}>
                    <motion.span initial={{ y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.05 }}>
                      {l === ' ' ? ' ' : l}
                    </motion.span>
                  </span>
                ))}
              </div>
              <div className="intro-horizon">
                <motion.i className="intro-sun" initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.45 }} />
                <motion.i className="intro-line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }} />
              </div>
              <motion.small initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.34em' }} transition={{ duration: 1, ease: EASE, delay: 0.6 }}>
                KANYAKUMARI
              </motion.small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
