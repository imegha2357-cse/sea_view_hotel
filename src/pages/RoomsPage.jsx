import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HOTEL, RATE_NOTE, ROOMS } from '../data/content';
import { img } from '../data/images';
import { pageMeta } from '../data/routes';
import { usePageMeta } from '../lib/seo';
import { rupees, whatsappUrl } from '../lib/enquiry';
import { EASE, Eyebrow, Reveal, SplitWords } from '../components/Motion';

const FILTERS = [
  ['all', 'All rooms'],
  ['sea', 'Sea view'],
  ['family', 'Families'],
  ['city', 'City view'],
];

export function Photo({ k, width = 1200, className, sizes = '100vw', eager }) {
  const i = img(k, { width });
  return (
    <img
      className={className}
      src={i.src}
      srcSet={i.srcSet}
      sizes={sizes}
      alt={i.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={(e) => {
        if (e.currentTarget.src !== i.fallback) {
          e.currentTarget.srcset = '';
          e.currentTarget.src = i.fallback;
        }
      }}
    />
  );
}

// Feature #22: all rooms side by side, with a filter and a comparison table.
export default function RoomsPage() {
  const meta = pageMeta('/rooms');
  usePageMeta(meta.title, meta.description);
  const [f, setF] = useState('all');
  const list = useMemo(() => (f === 'all' ? ROOMS : ROOMS.filter((r) => r.tags.includes(f))), [f]);
  const rows = [
    ['View', (r) => r.view],
    ['Beds', (r) => r.beds],
    ['Sleeps', (r) => r.occupancy],
    ['Size', (r) => r.size || 'Please ask'],
    ['From', (r) => (r.rate ? `${rupees(r.rate)} a night` : 'On enquiry')],
  ];

  return (
    <main id="main" className="page sub-page">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">Rooms</span>
        </nav>
        <Eyebrow onMount>Five ways to stay</Eyebrow>
        <SplitWords as="h1" text="Rooms and suites" className="sub-title" onMount />
        <p className="sub-lead">Every room has a private bathroom, television and direct-dial phone, with room service around the clock. {RATE_NOTE}</p>

        <div className="chips" role="group" aria-label="Filter rooms">
          {FILTERS.map(([id, label]) => (
            <button key={id} className={f === id ? 'on' : ''} aria-pressed={f === id} onClick={() => setF(id)}>
              {label}
            </button>
          ))}
        </div>

        <motion.div layout className="room-cards">
          {list.map((r, i) => (
            <motion.article layout key={r.id} className="room-card card-hover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}>
              <Link to={`/rooms/${r.id}`} className="room-card-img">
                <Photo k={r.image} width={828} sizes="(max-width: 700px) 100vw, 33vw" />
              </Link>
              <div className="room-card-body">
                <span className="tag">{r.view}</span>
                <h2>
                  <Link to={`/rooms/${r.id}`}>{r.name}</Link>
                </h2>
                <p>{r.summary}</p>
                <p className="meta">Sleeps {r.occupancy}</p>
                <Link to={`/rooms/${r.id}`} className="link-arrow">
                  See the room <i>→</i>
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <Reveal as="section" className="compare" aria-labelledby="compare-h">
          <h2 id="compare-h">Compare rooms</h2>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Feature</span>
                  </th>
                  {ROOMS.map((r) => (
                    <th key={r.id} scope="col">
                      <Link to={`/rooms/${r.id}`}>{r.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {ROOMS.map((r) => (
                      <td key={r.id}>{get(r)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">Highlights</th>
                  {ROOMS.map((r) => (
                    <td key={r.id}>{r.features.join(', ')}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>

        <div className="sub-cta">
          <p>Not sure which room suits you? Tell us who is travelling and we will suggest one.</p>
          <div className="form-actions">
            <Link to="/#enquire" className="btn solid">
              Send an enquiry
            </Link>
            <a href={whatsappUrl()} className="btn outline wa" target="_blank" rel="noreferrer">
              WhatsApp {HOTEL.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
