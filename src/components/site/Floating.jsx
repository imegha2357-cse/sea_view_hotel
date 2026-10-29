'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HOTEL } from '@/data/content';
import { Icon } from './ui';

// Back to top (bottom left) and chat (bottom right), as on the Taj site. Chat opens WhatsApp.
export default function Floating() {
  const [show, setShow] = useState(false);
  const [chat, setChat] = useState(false);
  useEffect(() => {
    // The chat button waits until the visitor scrolls, so it never covers the hero's buttons.
    const on = () => {
      setShow(window.scrollY > 900);
      setChat(window.scrollY > 420);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.button
            className="fab-top"
            aria-label="Back to top"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
          >
            <Icon.up />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
      {chat && (
      <motion.a
        key="chat"
        className="fab-chat"
        href={`https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(`Hello ${HOTEL.name}, I have a question.`)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with the hotel on WhatsApp (opens in a new tab)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
      >
        <span className="ping" aria-hidden="true" />
        <Icon.chat />
      </motion.a>
      )}
      </AnimatePresence>
    </>
  );
}
