'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { amenityLabel } from '@/lib/hotel-knowledge';
import { rupees } from '@/lib/enquiry';
import { trackEvent } from '@/lib/analytics';
import Photo from '../Photo';

const ROWS = [
  ['View', (r) => r.view || '—'],
  ['Beds', (r) => r.beds || '—'],
  ['Guests', (r) => (r.guests ? `Up to ${r.guests}` : r.occupancy || '—')],
  ['Size', (r) => r.size || 'Please ask'],
  ['Price', (r) => (r.rate ? `From ${rupees(r.rate)} a night` : 'On enquiry')],
  ['Amenities', (r) => (r.amenities || []).map(amenityLabel).filter(Boolean).join(', ') || '—'],
  ['Highlights', (r) => (r.features?.length ? r.features.join(', ') : '—')],
  ['Accessibility', (r) => (r.access?.length ? r.access.join(', ') : 'Please ask')],
];

function Inner({ rooms }) {
  const q = useSearchParams();
  const [pick, setPick] = useState(() => rooms.slice(0, 3).map((r) => r.id));
  useEffect(() => {
    const a = q.get('a');
    if (a && rooms.some((r) => r.id === a)) setPick((p) => [a, ...p.filter((x) => x !== a)].slice(0, 3));
  }, [q, rooms]);
  const chosen = pick.map((id) => rooms.find((r) => r.id === id)).filter(Boolean);
  return (
    <section className="sec" style={{ paddingTop: 24 }}>
      <div className="container wide">
        <fieldset className="cmp-pick">
          <legend>Choose rooms (up to 3)</legend>
          {rooms.map((r) => (
            <label key={r.id} className={`chip ${pick.includes(r.id) ? 'on' : ''}`}>
              <input type="checkbox" checked={pick.includes(r.id)} disabled={!pick.includes(r.id) && pick.length >= 3} onChange={(e) => setPick((p) => (e.target.checked ? [...p, r.id] : p.filter((x) => x !== r.id)))} />
              {r.name}
            </label>
          ))}
        </fieldset>
        {chosen.length > 0 && (
          <div className="table-wrap">
            <table className="compare-table cmp">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Feature</span>
                  </th>
                  {chosen.map((r) => (
                    <th key={r.id} scope="col">
                      <a href={`/rooms/${r.id}`} className="cmp-head">
                        <span className="frame">
                          <Photo k={r.images?.[0]} sizes="240px" alt="" />
                        </span>
                        {r.name}
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, get]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {chosen.map((r) => (
                      <td key={r.id}>{get(r)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">
                    <span className="sr-only">Ask</span>
                  </th>
                  {chosen.map((r) => (
                    <td key={r.id}>
                      <a className="btn solid sm" href={`/enquire?room_type=${encodeURIComponent(r.name)}`} onClick={() => trackEvent('compare_enquire', { room: r.id })}>
                        Ask about this room
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <p className="meta" style={{ marginTop: 16 }}>
          Not sure? <a href="/room-finder">Let us suggest a room</a>.
        </p>
      </div>
    </section>
  );
}

export default function CompareRooms(props) {
  return (
    <Suspense>
      <Inner {...props} />
    </Suspense>
  );
}
