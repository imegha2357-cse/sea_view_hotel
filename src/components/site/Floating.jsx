'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatWidget from './ChatWidget';
import { Icon } from './ui';

// Back to top (bottom left) and the chat assistant (bottom right), as on the Taj site.
export default function Floating() {
  const [show, setShow] = useState(false);
  const [chat, setChat] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    // On the homepage the chat button waits until the visitor scrolls, so it never covers the hero's buttons.
    const on = () => {
      setShow(window.scrollY > 900);
      setChat(pathname !== '/' || window.scrollY > 420);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname]);
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
      <ChatWidget visible={chat} />
    </>
  );
}
