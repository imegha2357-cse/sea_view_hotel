'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { recommend } from '@/lib/chat-brain';
import { trackEvent } from '@/lib/analytics';
import Photo from '../Photo';
import { EASE } from '../site/ui';

const QS = [
  { id: 'who', q: 'Who is travelling?', a: [['couple', 'Two of us', 2, 'couple'], ['family', 'Family with children', 4, 'family kids'], ['friends', 'Friends or a group', 3, ''], ['work', 'On work', 1, 'business work']] },
  { id: 'view', q: 'How important is the sea view?', a: [['sea', 'I want to watch the sunrise from the room', 0, 'sea sunrise view'], ['nice', 'Nice to have', 0, ''], ['no', 'Not important, keep it simple', 0, 'budget simple']] },
  { id: 'why', q: 'What is the trip for?', a: [['special', 'Honeymoon or a celebration', 0, 'special honeymoon'], ['pilgrim', 'Temple visit or pilgrimage', 0, ''], ['sight', 'Sightseeing', 0, ''], ['work', 'Work or a meeting', 0, 'work']] },
];

// Three questions, then the same room recommender the chat assistant uses. Only real room facts.
export default function RoomFinder({ rooms }) {
  const [ans, setAns] = useState({});
  const step = QS.findIndex((x) => !ans[x.id]);
  const done = step === -1;
  let result = null;
  if (done) {
    const picked = QS.map((x) => x.a.find((a) => a[0] === ans[x.id]));
    const total = Math.max(...picked.map((p) => p[2]), 1);
    const q = picked.map((p) => p[3]).join(' ');
    result = recommend(rooms, { guests: { total, children: ans.who === 'family' ? 1 : 0 }, q });
  }
  return (
    <section className="sec" style={{ paddingTop: 24 }}>
      <div className="container finder">
        {!done && (
          <p className="finder-step">
            Question {step + 1} of {QS.length}
          </p>
        )}
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.fieldset key={QS[step].id} className="finder-q" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }}>
              <legend>{QS[step].q}</legend>
              {QS[step].a.map(([id, label]) => (
                <button key={id} type="button" className="finder-a" onClick={() => setAns((x) => ({ ...x, [QS[step].id]: id }))}>
                  {label}
                </button>
              ))}
            </motion.fieldset>
          ) : (
            <motion.div key="res" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <h2>Our suggestion</h2>
              {result.tooBig && <p className="notice">For larger groups, book several rooms. Our team can arrange rooms next to each other.</p>}
              <ul className="finder-res" role="list">
                {result.picks.map(({ r, why }, i) => (
                  <li key={r.id}>
                    <a href={`/rooms/${r.id}`} onClick={() => trackEvent('room_finder_pick', { room: r.id })}>
                      <span className="frame">
                        <Photo k={r.images?.[0]} sizes="(max-width: 700px) 100vw, 40vw" alt="" />
                      </span>
                      <b>
                        {i === 0 ? 'Best match: ' : 'Also good: '}
                        {r.name}
                      </b>
                      {why.length > 0 && <span>It {why.join(', ')}.</span>}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="card-actions">
                <a className="btn solid" href={`/enquire?room_type=${encodeURIComponent(result.picks[0]?.r.name || '')}`}>
                  Ask about {result.picks[0]?.r.name}
                </a>
                <button type="button" className="btn outline" onClick={() => setAns({})}>
                  Start again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
