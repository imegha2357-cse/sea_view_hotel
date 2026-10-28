import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { GALLERY } from '../data/content';
import { img } from '../data/images';
import SmartImg from '../components/SmartImg';
import { EASE, SectionHeading } from '../components/Motion';

const CATS = ['All', 'Rooms', 'Dining', 'Views', 'Hotel'];

export default function Gallery() {
  const [cat, setCat] = useState('All');
  const [index, setIndex] = useState(null);
  const items = GALLERY.filter((g) => cat === 'All' || g.cat === cat);

  return (
    <section className="section white" id="gallery">
      <div className="container">
        <div className="rooms-top">
          <SectionHeading eyebrow="Gallery" title="A look around" />
          {/* #65 category filter */}
          <LayoutGroup id="gal-filter">
            <div className="chips" role="group" aria-label="Filter photos">
              {CATS.map((c) => (
                <button key={c} className={`chip ${cat === c ? 'on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {cat === c && <motion.span className="chip-bg" layoutId="gal-bg" transition={{ duration: 0.35, ease: EASE }} />}
                  {c}
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
        {/* #61 masonry fade-in */}
        <div className="masonry">
          {items.map((g, i) => (
            <motion.button
              key={`${cat}-${g.image}`}
              className="tile"
              onClick={() => setIndex(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: EASE, delay: (i % 4) * 0.06 }}
              aria-label={`Open photo: ${img(g.image).alt}`}
            >
              <motion.div layoutId={`gal-${cat}-${g.image}`}>
                <SmartImg name={g.image} />
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>{index !== null && <Lightbox items={items} cat={cat} index={index} setIndex={setIndex} />}</AnimatePresence>
    </section>
  );
}

// #62 thumbnail-to-lightbox zoom, #63 drag-follow swipe, #64 crossfade, #66 backdrop, #67 thumb strip follow
function Lightbox({ items, cat, index, setIndex }) {
  const [dir, setDir] = useState(0);
  const stripRef = useRef(null);
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const item = items[index];
  const meta = img(item.image);

  const go = (d) => {
    setDir(d);
    setIndex((i) => (i + d + items.length) % items.length);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  });

  useEffect(() => {
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;
    const btn = track.children[index];
    const center = btn.offsetLeft + btn.offsetWidth / 2;
    const x = Math.min(0, Math.max(strip.clientWidth / 2 - center, strip.clientWidth - track.scrollWidth));
    setOffset(x);
  }, [index]);

  return (
    <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="lb-top">
        <span>
          {index + 1} / {items.length} · {meta.alt}
        </span>
        <button className="lb-close" onClick={() => setIndex(null)} aria-label="Close photo viewer">
          ×
        </button>
      </div>
      <div className="lb-stage">
        <button className="nav-btn prev" onClick={() => go(-1)} aria-label="Previous photo">
          ‹
        </button>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={item.image}
            className="lb-img"
            src={meta.src}
            onError={(e) => {
              if (e.currentTarget.src !== meta.fallback) e.currentTarget.src = meta.fallback;
            }}
            alt={meta.alt}
            layoutId={`gal-${cat}-${item.image}`}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.4, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) go(1);
              else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
            }}
            draggable={false}
          />
        </AnimatePresence>
        <button className="nav-btn next" onClick={() => go(1)} aria-label="Next photo">
          ›
        </button>
      </div>
      <div className="thumbs" ref={stripRef}>
        <div className="thumbs-track" ref={trackRef} style={{ transform: `translateX(${offset}px)` }}>
          {items.map((g, k) => {
            const m = img(g.image);
            return (
              <button key={g.image} className={k === index ? 'on' : ''} onClick={() => { setDir(k > index ? 1 : -1); setIndex(k); }} aria-label={`Photo ${k + 1}`}>
                <img src={m.src} alt="" loading="lazy" onError={(e) => { if (e.currentTarget.src !== m.fallback) e.currentTarget.src = m.fallback; }} />
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
