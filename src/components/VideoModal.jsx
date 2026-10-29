import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { VIDEO } from '../data/content';
import { EASE } from './Motion';
import { lockScroll, unlockScroll } from '../lib/scroll';

// The hotel's room tour plays in a full-screen viewer that opens from the play button.
export const playTour = () => window.dispatchEvent(new Event('seaview:play-tour'));

export default function VideoModal() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    const onOpen = () => {
      lastFocus.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener('seaview:play-tour', onOpen);
    return () => window.removeEventListener('seaview:play-tour', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="video-modal" role="dialog" aria-modal="true" aria-label="Hotel Sea View room tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={() => setOpen(false)} data-lenis-prevent>
          <motion.div className="video-frame" initial={{ clipPath: 'inset(45% 45% 45% 45% round 999px)' }} animate={{ clipPath: 'inset(0% 0% 0% 0% round 6px)' }} exit={{ clipPath: 'inset(45% 45% 45% 45% round 999px)' }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }} onClick={(e) => e.stopPropagation()}>
            <video src={VIDEO.tour} poster={VIDEO.tourPoster} controls autoPlay playsInline preload="auto" />
          </motion.div>
          <button ref={closeRef} className="video-close" onClick={() => setOpen(false)} aria-label="Close video">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
