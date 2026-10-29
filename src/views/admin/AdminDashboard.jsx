'use client';

import { useState } from 'react';
import { Link } from '@/lib/router';
import { motion } from 'framer-motion';
import { useAuth, useIdleSignOut } from '../../lib/auth';
import Brand from '@/components/site/Brand';
import { EASE } from '../../components/Motion';
import AvailabilityEditor from './AvailabilityEditor';
import Inbox from './Inbox';
import ContentManager from './content/ContentManager';

// Staff dashboard. The website content comes first; then fully booked nights and the inbox
// (newsletter sign-ups, site feedback and error reports). Guest enquiries now arrive on WhatsApp.
const NAV = [
  {
    group: 'Website',
    items: [
      ['rooms', 'Rooms', 'M3 18V7 M3 13h18v5 M21 18v-3a3 3 0 0 0-3-3H10v1'],
      ['photos', 'Photo library', 'M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M15.5 9.5h.01'],
      ['home', 'Slides, banners and gallery', 'M3 4h18v12H3z M8 20h8 M12 16v4'],
      ['offers', 'Offers', 'M20 12l-8 8-9-9V3h8z M7.5 7.5h.01'],
    ],
  },
  {
    group: 'Hotel',
    items: [
      ['availability', 'Fully booked nights', 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4'],
      ['inbox', 'Inbox', 'M3 13l3-8h12l3 8v6H3z M3 13h5l1 2h6l1-2h5'],
    ],
  },
];
const TITLES = { rooms: 'Rooms', photos: 'Photo library', home: 'Slides, banners and gallery', offers: 'Offers', availability: 'Fully booked nights', inbox: 'Inbox' };
const INTRO = {
  rooms: 'Add, change or remove room types and their photos. Changes appear on the website straight away.',
  photos: 'Upload photos once, then use them in rooms, slides, banners, highlights, the gallery and offers.',
  home: 'Homepage slides, page banners, highlight photos and the gallery.',
  offers: 'Offers and packages shown on the website.',
  availability: 'Mark nights when the hotel is full. Guests cannot pick those nights on the website.',
  inbox: 'Newsletter sign-ups, website feedback and error reports.',
};

export default function AdminDashboard() {
  const { user, logout, staffRole, canEdit } = useAuth();
  const idleWarn = useIdleSignOut(30);
  const [tab, setTab] = useState('rooms');
  const me = user?.email || '';
  const isWebsite = NAV[0].items.some(([id]) => id === tab);

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="container wide">
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Hotel Sea View home">
            <Brand />
          </Link>
          <nav aria-label="Account">
            <span className="who">
              {me} · {staffRole === 'viewer' ? 'view only' : staffRole}
            </span>
            <Link to="/">View website</Link>
            <button className="text-btn" onClick={logout}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      {idleWarn && (
        <div className="idle-bar" role="alert">
          You will be signed out in one minute because of inactivity. Move the mouse or press a key to stay signed in.
        </div>
      )}
      <div className="container wide dash-shell">
        <aside className="dash-side" aria-label="Dashboard sections">
          {NAV.map((g) => (
            <div key={g.group} className="dash-side-group">
              <p className="dash-side-k">{g.group}</p>
              <ul>
                {g.items.map(([id, label, d]) => (
                  <li key={id}>
                    <button type="button" className={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
                      {tab === id && <motion.span layoutId="side-on" className="dash-side-on" transition={{ duration: 0.35, ease: EASE }} />}
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d={d} />
                      </svg>
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
        <main id="main" className="dash-body">
          <div className="dash-head">
            <div>
              <p className="dash-crumb">{isWebsite ? 'Website' : 'Hotel'}</p>
              <h1>{TITLES[tab]}</h1>
              <p>{INTRO[tab]}</p>
            </div>
          </div>
          {isWebsite && <ContentManager canEdit={canEdit} me={me} section={tab} />}
          {tab === 'availability' && <AvailabilityEditor canEdit={canEdit} me={me} />}
          {tab === 'inbox' && <Inbox canEdit={canEdit} />}
        </main>
      </div>
    </div>
  );
}
