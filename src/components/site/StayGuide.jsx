'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { STAY_REQUESTS } from '@/data/requests';
import { waLink } from '@/lib/enquiry';
import RequestForm from '../RequestForm';

const LABELS = { wifi: 'Wi-Fi', breakfast: 'Breakfast', reception: 'Reception', roomservice: 'Room service', housekeeping: 'Housekeeping', laundry: 'Laundry', emergency: 'In an emergency' };

function Guide({ info, checkIn, checkOut, phone, phoneHref, restaurantPhone, restaurantHref }) {
  const q = useSearchParams();
  const room = (q.get('room') || '').replace(/[^\w-]/g, '').slice(0, 8);
  const [open, setOpen] = useState(false);
  const rows = Object.entries(LABELS).filter(([k]) => info[k]);
  return (
    <div className="stay">
      <header className="stay-head">
        <p className="stay-k">Hotel Sea View · Room guide</p>
        <h1>Welcome{room ? ` to room ${room}` : ''}</h1>
        <p>Everything you need during your stay, on your phone.</p>
      </header>
      <div className="stay-quick">
        <a className="stay-btn" href={`tel:${phoneHref}`}>
          <b>Call reception</b>
          <span>{phone}</span>
        </a>
        <a className="stay-btn" href={waLink(`Hello, this is ${room ? `room ${room}` : 'a guest'}. `)} target="_blank" rel="noopener noreferrer">
          <b>WhatsApp the desk</b>
          <span>Quick replies</span>
        </a>
        <a className="stay-btn" href={`tel:${restaurantHref}`}>
          <b>Order food</b>
          <span>{restaurantPhone}</span>
        </a>
        <a className="stay-btn" href="/dining/menu">
          <b>See the menu</b>
          <span>Sea View Restaurant</span>
        </a>
      </div>
      {(checkIn || checkOut || rows.length > 0) && (
        <dl className="stay-info">
          {checkOut && (
            <div>
              <dt>Check-out</dt>
              <dd>By {checkOut}. Need longer? Ask for a late check-out below.</dd>
            </div>
          )}
          {checkIn && (
            <div>
              <dt>Check-in</dt>
              <dd>From {checkIn}</dd>
            </div>
          )}
          {rows.map(([k, l]) => (
            <div key={k}>
              <dt>{l}</dt>
              <dd>{info[k]}</dd>
            </div>
          ))}
        </dl>
      )}
      <section className="stay-req" aria-labelledby="stay-req-h">
        <h2 id="stay-req-h">Ask for something</h2>
        <p className="meta">Towels, water, cleaning, a late check-out, a taxi or anything that is not working.</p>
        {open ? (
          <RequestForm type="stay" compact roomNumber={room} submitLabel="Send to the front desk" fields={[{ key: 'need', label: 'What do you need?', type: 'select', required: true, options: STAY_REQUESTS }, ...(room ? [] : [{ key: 'room', label: 'Room number', type: 'text', required: true }])]} />
        ) : (
          <button type="button" className="btn solid" onClick={() => setOpen(true)}>
            Make a request
          </button>
        )}
      </section>
      <nav className="stay-links" aria-label="More">
        <a href="/guides">Things to do nearby</a>
        <a href="/request/tour">Book sightseeing or a taxi</a>
        <a href="/request/celebration">Plan a surprise</a>
        <a href="/plan-your-visit">Timings and festivals</a>
      </nav>
    </div>
  );
}

export default function StayGuide(props) {
  return (
    <Suspense>
      <Guide {...props} />
    </Suspense>
  );
}
