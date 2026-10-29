'use client';

import { motion } from 'framer-motion';
import Photo from '../Photo';
import { EASE, KenBurns } from './ui';

// Inner-page banner: one photo with a slow zoom and the page title with a drawn rule.
export default function Banner({ image, title, text, alt }) {
  return (
    <section className="banner" data-hero>
      <KenBurns duration={14}>
        <Photo k={image} alt={alt ?? ''} sizes="(orientation: portrait) 180vh, 100vw" priority />
      </KenBurns>
      <div className="container wide banner-in">
        <motion.h1 initial="hide" animate="show">
          <motion.span className="line" aria-hidden="true" variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE, delay: 0.2 } } }} />
          <motion.span variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.35 } } }}>{title}</motion.span>
        </motion.h1>
        {text && (
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}>
            {text}
          </motion.p>
        )}
      </div>
    </section>
  );
}
