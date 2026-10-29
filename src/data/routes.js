// One list of public pages with their title and description (PRD 10.1: unique per page).
// Used by the pages themselves and by scripts/prerender.mjs, which writes per-page HTML and sitemap.xml.
import { ROOMS } from './content.js';

// Keep descriptions under about 160 characters, cut at a word.
const clip = (s, n = 160) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n - 1))}…`);

export const PAGES = [
  {
    path: '/',
    title: 'Hotel Sea View, Kanyakumari | Sea-View Rooms by the Beach',
    description:
      'Sea-view rooms facing the sunrise on East Car Street, Kanyakumari, near the beach. Multi-cuisine restaurant, 24-hour room service and free parking.',
    priority: '1.0',
  },
  {
    path: '/rooms',
    title: 'Rooms and suites | Hotel Sea View, Kanyakumari',
    description: 'Compare the five room types at Hotel Sea View, Kanyakumari: Standard, Deluxe Seaview, Corner Deluxe, interconnected Twin Rooms and the Executive Suite.',
    priority: '0.9',
  },
  ...ROOMS.map((r) => ({
    path: `/rooms/${r.id}`,
    title: `${r.name} | Hotel Sea View, Kanyakumari`,
    description: clip(`${r.summary} ${r.view}. Sleeps ${r.occupancy}.`),
    priority: '0.8',
    room: r.id,
  })),
  {
    path: '/dining',
    title: 'Dining | Sea View Restaurant and Wave Bar, Kanyakumari',
    description: 'Sea View Restaurant serves Indian, Chinese and Continental food, vegetarian and non-vegetarian. Drinks at the Wave Bar and 24-hour room service.',
    priority: '0.8',
  },
  {
    path: '/experiences',
    title: 'Experiences in Kanyakumari | Hotel Sea View',
    description: 'The Vivekananda Rock Memorial, Thiruvalluvar Statue, Kanyakumari Beach, Gandhi Memorial and Sunset Point, with sightseeing from our travel desk.',
    priority: '0.7',
  },
  {
    path: '/offers',
    title: 'Offers | Hotel Sea View, Kanyakumari',
    description: 'Current offers and packages at Hotel Sea View, Kanyakumari. Ask our team about rates for your dates.',
    priority: '0.6',
  },
  {
    path: '/gallery',
    title: 'Photo gallery | Hotel Sea View, Kanyakumari',
    description: 'Photos of Hotel Sea View, Kanyakumari: rooms, the restaurant and bar, the conference hall and the landmarks nearby.',
    priority: '0.6',
  },
  {
    path: '/about',
    title: 'About Hotel Sea View, Kanyakumari',
    description: 'Hotel Sea View on East Car Street, Kanyakumari: sea-view rooms facing the sunrise, a multi-cuisine restaurant, Wave Bar and a travel desk.',
    priority: '0.5',
  },
  {
    path: '/contact',
    title: 'Contact Hotel Sea View, Kanyakumari',
    description: 'Phone, WhatsApp, email and address for Hotel Sea View, East Car Street, Kanyakumari, Tamil Nadu 629 702.',
    priority: '0.6',
  },
  {
    path: '/enquire',
    title: 'Check availability | Hotel Sea View, Kanyakumari',
    description: 'Send a booking enquiry to Hotel Sea View, Kanyakumari. Our team confirms availability and price by phone or WhatsApp.',
    priority: '0.7',
  },
  {
    path: '/accessibility',
    title: 'Accessibility | Hotel Sea View',
    description: 'How the Hotel Sea View website supports keyboard use, screen readers, larger text and reduced motion, and how to tell us about a problem.',
    priority: '0.2',
  },
  {
    path: '/plan-your-visit',
    title: 'Plan your visit to Kanyakumari | Hotel Sea View',
    description: 'Sunrise and sunset times, the weather, how to reach Kanyakumari by train, bus or air, and suggested day plans from Hotel Sea View.',
    priority: '0.7',
  },
  {
    path: '/meetings',
    title: 'Meetings and events | Hotel Sea View, Kanyakumari',
    description: 'A conference hall for meetings, training and family functions in Kanyakumari, with catering from Sea View Restaurant and rooms for guests.',
    priority: '0.6',
  },
  {
    path: '/policies',
    title: 'Hotel policies | Hotel Sea View, Kanyakumari',
    description: 'Parking, room service, children and other hotel policies at Hotel Sea View, Kanyakumari. Ask us about anything not listed.',
    priority: '0.5',
  },
  {
    path: '/room-tour',
    title: 'Room tour video | Hotel Sea View, Kanyakumari',
    description: 'Watch a 73-second tour of Hotel Sea View: the corridor, a deluxe room, the balcony view of the sea and the Vivekananda Rock Memorial by day and night.',
    priority: '0.6',
  },
  {
    path: '/privacy',
    title: 'Privacy notice | Hotel Sea View',
    description: 'How Hotel Sea View, Kanyakumari collects and uses the details you send in a booking enquiry.',
    priority: '0.3',
  },
];

export const pageMeta = (path) => PAGES.find((p) => p.path === path) || PAGES[0];
