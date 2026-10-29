import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HOTEL, RATE_NOTE, ROOMS } from '../data/content';
import { pageMeta } from '../data/routes';
import { usePageMeta } from '../lib/seo';
import { rupees, whatsappUrl } from '../lib/enquiry';
import { useAuth } from '../lib/auth';
import { EASE, Eyebrow, SplitWords } from '../components/Motion';
import EnquiryForm from '../components/EnquiryForm';
import NotFound from './NotFound';
import { Photo } from './RoomsPage';

// Feature #23: a page for each room type, with its own address, title and structured data.
export default function RoomDetail() {
  const { id } = useParams();
  const r = ROOMS.find((x) => x.id === id);
  const meta = pageMeta(`/rooms/${id}`);
  usePageMeta(r ? meta.title : 'Room not found | Hotel Sea View', r ? meta.description : '', { noindex: !r });
  // Structured data for this room is written into the page HTML by scripts/prerender.mjs.
  const { user, profile, saveProfile } = useAuth();
  const [savedMsg, setSavedMsg] = useState('');
  if (!r) return <NotFound />;

  const idx = ROOMS.indexOf(r);
  const next = ROOMS[(idx + 1) % ROOMS.length];
  const isSaved = profile?.saved_rooms?.includes(r.id);
  const toggleSave = async () => {
    const list = profile?.saved_rooms || [];
    await saveProfile({ saved_rooms: isSaved ? list.filter((x) => x !== r.id) : [...list, r.id].slice(0, 10) }).catch(() => setSavedMsg('Could not save.'));
    setSavedMsg(isSaved ? 'Removed from saved rooms' : 'Saved to your account');
  };

  return (
    <main id="main" className="page sub-page">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <Link to="/rooms">Rooms</Link> <span aria-hidden="true">/</span>{' '}
          <span aria-current="page">{r.name}</span>
        </nav>
        <div className="room-detail">
          <motion.div className="room-detail-img" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 1.1, ease: EASE }}>
            <Photo k={r.image} width={1920} sizes="(max-width: 900px) 100vw, 60vw" eager />
          </motion.div>
          <div className="room-detail-body">
            <Eyebrow onMount>{r.view}</Eyebrow>
            <SplitWords as="h1" text={r.name} className="sub-title" onMount />
            <p className="sub-lead">{r.summary}</p>
            <dl className="room-facts">
              <dt>Beds</dt>
              <dd>{r.beds}</dd>
              <dt>Sleeps</dt>
              <dd>{r.occupancy}</dd>
              <dt>Size</dt>
              <dd>{r.size || 'Please ask'}</dd>
              <dt>Price</dt>
              <dd>{r.rate ? `From ${rupees(r.rate)} a night` : 'On enquiry'}</dd>
            </dl>
            <h2 className="h-small">In the room</h2>
            <ul className="tick-list">
              {r.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
              {['Private bathroom', 'Television', 'Direct-dial phone', '24-hour room service']
                .filter((x) => !r.features.includes(x))
                .map((x) => (
                  <li key={x}>{x}</li>
                ))}
            </ul>
            <p className="meta">{RATE_NOTE}</p>
            <div className="form-actions">
              <a href="#room-enquire" className="btn solid">
                Enquire about this room
              </a>
              <a href={whatsappUrl({ room_type: r.name })} className="btn outline wa" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              {user && (
                <button className="text-btn" onClick={toggleSave} aria-pressed={!!isSaved}>
                  {isSaved ? '★ Saved' : '☆ Save this room'}
                </button>
              )}
              {savedMsg && <span className="saved" role="status">{savedMsg}</span>}
            </div>
            <Link to="/room-tour" className="link-arrow">
              Watch the room tour video <i>→</i>
            </Link>
          </div>
        </div>

        <section id="room-enquire" className="room-enquire" aria-labelledby="re-h">
          <h2 id="re-h">Ask about the {r.name}</h2>
          <EnquiryForm prefill={{ room_type: r.name }} />
        </section>

        <nav className="next-room" aria-label="Next room">
          <Link to={`/rooms/${next.id}`} className="card-hover">
            <span className="meta">Next room</span>
            <b>{next.name}</b>
            <span className="link-arrow">
              View <i>→</i>
            </span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
