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
import { BlogPanel, GuestsPanel, HistoryPanel, HousekeepingPanel, InventoryPanel, QrPanel, RequestsPanel, SettingsPanel, StaffPanel } from './HotelPanels';

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
      ['lists', 'Menu, reviews and lists', 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01'],
      ['blog', 'News and blog', 'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5'],
      ['settings', 'Settings and theme', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 3a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 9a2 2 0 1 1 0 4z'],
      ['history', 'Change history', 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 3'],
    ],
  },
  {
    group: 'Hotel',
    items: [
      ['requests', 'Requests', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
      ['availability', 'Fully booked nights', 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4'],
      ['inventory', 'Rooms left per night', 'M4 20V10 M10 20V4 M16 20v-8 M22 20H2'],
      ['housekeeping', 'Housekeeping', 'M3 21h18 M5 21V9l7-5 7 5v12 M9 21v-6h6v6'],
      ['guests', 'Guests and loyalty', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8'],
      ['qr', 'QR codes', 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 20h1 M17 20h1 M20 17h1'],
      ['staff', 'Staff accounts', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
      ['inbox', 'Inbox', 'M3 13l3-8h12l3 8v6H3z M3 13h5l1 2h6l1-2h5'],
    ],
  },
];
const TITLES = Object.fromEntries(NAV.flatMap((g) => g.items.map(([id, label]) => [id, label])));
const INTRO = {
  rooms: 'Add, change or remove room types and their photos. Changes appear on the website straight away.',
  photos: 'Upload photos once, then use them in rooms, slides, banners, highlights, the gallery and offers.',
  home: 'Homepage slides, page banners, highlight photos and the gallery.',
  offers: 'Offers and packages shown on the website.',
  availability: 'Mark nights when the hotel is full. Guests cannot pick those nights on the website.',
  inbox: 'Newsletter sign-ups, website feedback and error reports.',
  lists: 'Restaurant menu, guest reviews, policies, local timings, festivals, awards and guest photos.',
  blog: 'News and travel posts for the website. Good for search engines.',
  settings: 'Festival theme, check-in times, social links, review link, loyalty rules and the room guide.',
  history: 'Every change to the website, who made it and when. Undo any change.',
  requests: 'Group, corporate, gift, sightseeing, table, celebration, travel-agent, call-back and in-room requests from the website.',
  inventory: 'How many rooms of each type are left per night. Guests see "Only 2 left" when it is 3 or fewer.',
  housekeeping: 'Room status board for the front desk and housekeeping. Updates live on every screen.',
  guests: 'Guest accounts, loyalty points and upcoming birthdays and anniversaries.',
  qr: 'QR codes for rooms, tables and the reception desk.',
  staff: 'Who can sign in to this panel and what they can do.',
};
const WEBSITE = ['rooms', 'photos', 'home', 'offers', 'lists'];

export default function AdminDashboard() {
  const { user, logout, staffRole, canEdit } = useAuth();
  const idleWarn = useIdleSignOut(30);
  const [tab, setTab] = useState('rooms');
  const me = user?.email || '';
  const isWebsite = NAV[0].items.some(([id]) => id === tab);
  const nav = NAV.map((g) => ({ ...g, items: g.items.filter(([id]) => id !== 'staff' || staffRole === 'owner') }));

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
          {nav.map((g) => (
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
          {WEBSITE.includes(tab) && <ContentManager canEdit={canEdit} me={me} section={tab} />}
          {tab === 'blog' && <BlogPanel canEdit={canEdit} me={me} />}
          {tab === 'settings' && <SettingsPanel canEdit={canEdit} me={me} />}
          {tab === 'history' && <HistoryPanel canEdit={canEdit} me={me} />}
          {tab === 'requests' && <RequestsPanel canEdit={canEdit} />}
          {tab === 'inventory' && <InventoryPanel canEdit={canEdit} me={me} />}
          {tab === 'housekeeping' && <HousekeepingPanel me={me} staffRole={staffRole} />}
          {tab === 'guests' && <GuestsPanel canEdit={canEdit} me={me} />}
          {tab === 'qr' && <QrPanel />}
          {tab === 'staff' && <StaffPanel me={me} user={user} staffRole={staffRole} />}
          {tab === 'availability' && <AvailabilityEditor canEdit={canEdit} me={me} />}
          {tab === 'inbox' && <Inbox canEdit={canEdit} />}
        </main>
      </div>
    </div>
  );
}
