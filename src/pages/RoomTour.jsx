import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VIDEO, HOTEL } from '../data/content';
import { EASE, Eyebrow, SplitWords } from '../components/Motion';
import { usePageMeta } from '../lib/seo';
import { pageMeta } from '../data/routes';
import { whatsappUrl } from '../lib/enquiry';

// The room tour lives on its own page, so the home page never loads the video.
// Chapter times match the trimmed recording in public/media/room-tour.mp4.
const CHAPTERS = [
  { t: 0, label: 'Corridor' },
  { t: 17, label: 'Into the room' },
  { t: 22, label: 'Deluxe room' },
  { t: 38, label: 'Balcony and sea view' },
  { t: 47, label: 'Vivekananda Rock and Thiruvalluvar Statue' },
  { t: 56, label: 'The memorials at night' },
];

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function RoomTour() {
  const meta = pageMeta('/room-tour');
  usePageMeta(meta.title, meta.description);
  const ref = useRef(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    const on = () => setTime(v.currentTime);
    v.addEventListener('timeupdate', on);
    return () => v.removeEventListener('timeupdate', on);
  }, []);

  const seek = (t) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = t;
    v.play().catch(() => {});
  };

  const current = CHAPTERS.reduce((a, c, i) => (time >= c.t ? i : a), 0);

  return (
    <main id="main" className="tour-page">
      <div className="container tour-head">
        <Link to="/" className="link-arrow">
          ← Back to the hotel
        </Link>
        <Eyebrow onMount>Room tour · {VIDEO.duration}</Eyebrow>
        <SplitWords text="Step inside Hotel Sea View" as="h1" className="tour-title" onMount />
      </div>

      <motion.div className="container tour-player" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}>
        <div className="tour-frame">
          <video ref={ref} src={VIDEO.tour} poster={VIDEO.tourPoster} controls autoPlay muted playsInline preload="metadata" aria-label="Hotel Sea View room tour" />
        </div>
        <aside className="tour-chapters" aria-label="Chapters">
          <h2>In this video</h2>
          <ol>
            {CHAPTERS.map((c, i) => (
              <li key={c.t}>
                <button className={i === current ? 'on' : ''} onClick={() => seek(c.t)} aria-current={i === current ? 'true' : undefined}>
                  <span className="tc">{fmt(c.t)}</span>
                  <span>{c.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="tour-note">The video has no sound.</p>
        </aside>
      </motion.div>

      <div className="container tour-cta">
        <p>Like what you see? Ask us about dates and rates.</p>
        <div className="form-actions">
          <Link to="/#enquire" className="btn solid">
            Send an enquiry
          </Link>
          <a href={whatsappUrl()} className="btn outline wa" target="_blank" rel="noreferrer">
            WhatsApp {HOTEL.phone}
          </a>
        </div>
      </div>
    </main>
  );
}
