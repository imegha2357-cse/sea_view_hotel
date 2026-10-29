import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { VIDEO } from '../data/content';
import { Magnetic, SplitWords } from '../components/Motion';
import { Link } from 'react-router-dom';

// Cinematic band: a still from the room tour drifts with the scroll; the play button opens the tour.
export default function VideoBand() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1.15]);

  return (
    <section className="video-band" ref={ref} aria-label="Room tour video">
      <motion.img className="vb-bg" src={VIDEO.tourPoster} alt="" style={reduce ? undefined : { y, scale }} loading="lazy" />
      <div className="vb-shade" />
      <div className="container vb-inner">
        <SplitWords text="Step inside before you arrive" className="vb-title" />
        <Magnetic strength={0.4}>
          <Link to="/room-tour" className="vb-play" aria-label="Watch the room tour video">
            <span className="vb-ring" aria-hidden="true" />
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Link>
        </Magnetic>
        <p className="vb-meta">Room tour · corridors, rooms, the balcony view and the memorials at night · {VIDEO.duration} · opens the room tour page</p>
      </div>
    </section>
  );
}
