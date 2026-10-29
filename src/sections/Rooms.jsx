import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ROOMS, RATE_NOTE } from '../data/content';
import SmartImg from '../components/SmartImg';
import { EASE, Eyebrow, SplitWords } from '../components/Motion';
import { whatsappUrl } from '../lib/enquiry';
import { lockScroll, scrollToId, unlockScroll } from '../lib/scroll';

const useDesktop = () => {
  const q = '(min-width: 1024px) and (pointer: fine)';
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setOk(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return ok;
};

function RoomCard({ r, i, onOpen }) {
  return (
    <motion.button
      className="room-tile"
      layoutId={`room-${r.id}`}
      onClick={() => onOpen(r)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.08 }}
      aria-label={`${r.name}: view details`}
    >
      <div className="room-tile-img">
        <SmartImg name={r.image} sizes="(max-width: 1023px) 80vw, 34vw" width={828} />
        {r.tags.includes('sea') && <span className="badge">Sea view</span>}
      </div>
      <div className="room-tile-body">
        <span className="room-index">
          {i + 1} / {ROOMS.length}
        </span>
        <h3>{r.name}</h3>
        <p>{r.summary}</p>
        <span className="room-meta">
          {r.beds} · {r.occupancy}
        </span>
      </div>
    </motion.button>
  );
}

export default function Rooms({ onEnquire }) {
  const desktop = useDesktop();
  const reduce = useReducedMotion();
  const pinned = desktop && !reduce;
  const [open, setOpen] = useState(null);
  const outer = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);

  useLayoutEffect(() => {
    if (!pinned || !track.current) return undefined;
    const measure = () => setDist(Math.max(0, track.current.scrollWidth - window.innerWidth + 48));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const x = useSpring(xRaw, { stiffness: 120, damping: 30, mass: 0.4 });
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Cursor label that follows the pointer over the room cards
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const scx = useSpring(cx, { stiffness: 500, damping: 40 });
  const scy = useSpring(cy, { stiffness: 500, damping: 40 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    lockScroll();
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const head = (
    <div className="rooms-head container">
      <div>
        <Eyebrow>Rooms and suites</Eyebrow>
        <SplitWords text="Five ways to wake up by the sea" className="rooms-title" />
      </div>
      <p className="rooms-note">{RATE_NOTE}</p>
    </div>
  );

  const cards = ROOMS.map((r, i) => <RoomCard key={r.id} r={r} i={i} onOpen={setOpen} />);

  return (
    <section className="rooms" id="rooms">
      {pinned ? (
        <div className="rooms-pin" ref={outer} style={{ height: `calc(100vh + ${dist}px)` }}>
          <div className="rooms-sticky">
            {head}
            <motion.div
              className="rooms-track"
              ref={track}
              style={{ x }}
              onPointerMove={(e) => {
                cx.set(e.clientX);
                cy.set(e.clientY);
              }}
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
            >
              {cards}
            </motion.div>
            <div className="rooms-progress container" aria-hidden="true">
              <motion.i style={{ scaleX: bar }} />
            </div>
            <motion.div className="cursor-label" style={{ x: scx, y: scy }} animate={{ scale: hover && !open ? 1 : 0, opacity: hover && !open ? 1 : 0 }} transition={{ duration: 0.25, ease: EASE }} aria-hidden="true">
              View
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="rooms-static">
          {head}
          <div className="rooms-scroller" tabIndex={0} aria-label="Rooms, scroll sideways">
            {cards}
          </div>
        </div>
      )}

      {/* #54 card-to-detail expand, #57 dimmed backdrop */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} />
            <div className="sheet-wrap">
              <motion.div className="sheet" layoutId={`room-${open.id}`} role="dialog" aria-modal="true" aria-label={open.name} transition={{ duration: 0.55, ease: EASE }} style={{ position: 'relative' }} data-lenis-prevent>
                <button className="x" onClick={() => setOpen(null)} aria-label="Close">
                  ×
                </button>
                <div className="media">
                  <SmartImg name={open.image} eager sizes="(max-width: 860px) 100vw, 520px" width={1200} />
                </div>
                <motion.div className="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: EASE }}>
                  <span className="eyebrow">{open.view}</span>
                  <h3>{open.name}</h3>
                  <p style={{ color: 'var(--muted)' }}>{open.summary}</p>
                  <dl>
                    <dt>Beds</dt>
                    <dd>{open.beds}</dd>
                    <dt>Sleeps</dt>
                    <dd>{open.occupancy}</dd>
                    {open.size && (
                      <>
                        <dt>Size</dt>
                        <dd>{open.size}</dd>
                      </>
                    )}
                  </dl>
                  <ul>
                    {open.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <p className="form-note">{RATE_NOTE}</p>
                  <div className="actions">
                    <button
                      className="btn solid"
                      onClick={() => {
                        setOpen(null);
                        onEnquire({ room_type: open.name });
                        setTimeout(() => scrollToId('enquire'), 300);
                      }}
                    >
                      Enquire about this room
                    </button>
                    <a className="btn outline" href={whatsappUrl({ room_type: open.name })} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
