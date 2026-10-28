import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HOTEL } from '../data/content';
import { whatsappUrl } from '../lib/enquiry';
import { ChatIcon, PhoneIcon } from './Icons';
import { EASE } from './Motion';

// #95 sticky mobile bar, #98 WhatsApp single pulse, #21 back-to-top
export default function FloatingActions() {
  const [pastHero, setPastHero] = useState(false);
  const [deep, setDeep] = useState(false);
  const [pulse, setPulse] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.7);
      setDeep(window.scrollY > window.innerHeight * 1.2);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(() => setPulse(true), 6000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <a className="wa-fab" href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp">
        <ChatIcon />
        {pulse && !reduce && (
          <motion.span className="ring" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.4, ease: 'easeOut' }} />
        )}
      </a>

      <AnimatePresence>
        {deep && (
          <motion.button
            className="to-top"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span>↑</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pastHero && (
          <motion.nav
            className="mobile-bar"
            aria-label="Quick contact"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <a href={`tel:${HOTEL.phoneHref}`}>
              <PhoneIcon /> Call
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">
              <ChatIcon /> WhatsApp
            </a>
            <a href="/#enquire" className="primary">
              Enquire
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
