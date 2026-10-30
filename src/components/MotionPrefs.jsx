'use client';

import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';

// "Reduce motion" in the footer preferences turns off animations everywhere, on top of the
// operating system's own reduce-motion setting (which framer-motion already follows).
export default function MotionPrefs({ children }) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const read = () => setStill(document.documentElement.dataset.motion === 'reduce');
    read();
    window.addEventListener('sv-display', read);
    return () => window.removeEventListener('sv-display', read);
  }, []);
  return <MotionConfig reducedMotion={still ? 'always' : 'user'}>{children}</MotionConfig>;
}
