import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ROOMS, RATE_NOTE } from '../data/content';
import SmartImg from '../components/SmartImg';
import { EASE, SectionHeading } from '../components/Motion';
import { whatsappUrl } from '../lib/enquiry';

const FILTERS = [
  { id: 'all', label: 'All rooms' },
  { id: 'sea', label: 'Sea view' },
  { id: 'family', label: 'Family' },
];

export default function Rooms({ onEnquire }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const list = ROOMS.filter((r) => filter === 'all' || r.tags.includes(filter));

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section className="section white" id="rooms">
      <div className="container">
        <div className="rooms-top">
          <SectionHeading eyebrow="Rooms and suites" titleLines={['Rooms that face', 'the sunrise']} />
          {/* #56 filter with sliding pill and reflow */}
          <LayoutGroup id="room-filter">
            <div className="chips" role="group" aria-label="Filter rooms">
              {FILTERS.map((f) => (
                <button key={f.id} className={`chip ${filter === f.id ? 'on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                  {filter === f.id && <motion.span className="chip-bg" layoutId="chip-bg" transition={{ duration: 0.35, ease: EASE }} />}
                  {f.label}
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>

        <motion.div className="rooms-grid" layout>
          <AnimatePresence mode="popLayout">
            {list.map((r, i) => (
              <motion.button
                layout
                layoutId={`room-${r.id}`}
                key={r.id}
                className={`room-card card-hover ${r.tags.includes('sea') ? 'sheen' : ''}`}
                onClick={() => setOpen(r)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.08 }}
                aria-label={`${r.name}: view details`}
              >
                <div className="media">
                  {r.tags.includes('sea') && <span className="badge">Sea view</span>}
                  <SmartImg name={r.image} />
                </div>
                <div className="body">
                  <h3>{r.name}</h3>
                  <p>{r.summary}</p>
                  <div className="meta">
                    <span>{r.beds}</span>
                    <span>{r.occupancy}</span>
                  </div>
                  <div className="foot">
                    <span className="link-arrow">
                      View room <i>→</i>
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        <p className="rate-note">{RATE_NOTE}</p>
      </div>

      {/* #54 card-to-detail expand, #57 dimmed backdrop */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} />
            <div className="sheet-wrap">
              <motion.div className="sheet" layoutId={`room-${open.id}`} role="dialog" aria-modal="true" aria-label={open.name} transition={{ duration: 0.5, ease: EASE }} style={{ position: 'relative' }}>
                <button className="x" onClick={() => setOpen(null)} aria-label="Close">
                  ×
                </button>
                <div className="media">
                  <SmartImg name={open.image} eager />
                </div>
                <motion.div className="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
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
                        setTimeout(() => document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' }), 250);
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
