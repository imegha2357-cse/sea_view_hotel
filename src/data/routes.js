// One list of public pages with their title and description (PRD 10.1: unique per page).
// Room pages are added from the admin-managed rooms (see rooms/[id]/page.jsx and sitemap.js).
import { GUIDES } from './content.js';

// Keep descriptions under about 160 characters, cut at a word.
export const clip = (s, n = 160) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n - 1))}…`);

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
    description: 'Rooms and suites at Hotel Sea View, Kanyakumari: sea-view rooms facing the sunrise, city-view and family rooms. Compare views, beds and sizes.',
    priority: '0.9',
  },
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
    path: '/guides',
    title: 'Kanyakumari travel guides | Hotel Sea View',
    description: 'Short guides to Kanyakumari from Hotel Sea View: watching the sunrise, and the best time of year to visit.',
    priority: '0.5',
  },
  ...GUIDES.map((g) => ({
    path: `/guides/${g.slug}`,
    title: `${g.title} | Hotel Sea View`,
    description: g.summary,
    priority: '0.5',
  })),
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

// Pages added in update 5 (forms, menu, news, room tools, local and language pages).
PAGES.push(
  { path: '/dining/menu', title: 'Restaurant menu | Sea View Restaurant, Kanyakumari', description: 'The menu at Sea View Restaurant, Hotel Sea View, Kanyakumari: Indian, Chinese and Continental dishes, vegetarian and non-vegetarian.', priority: '0.6' },
  { path: '/news', title: 'News and travel notes | Hotel Sea View, Kanyakumari', description: 'News from Hotel Sea View and travel notes about Kanyakumari: sunrise, temples, ferries and festivals.', priority: '0.5' },
  { path: '/rooms/compare', title: 'Compare rooms | Hotel Sea View, Kanyakumari', description: 'Compare the rooms at Hotel Sea View side by side: view, beds, size, guests and amenities.', priority: '0.6' },
  { path: '/room-finder', title: 'Find your room | Hotel Sea View, Kanyakumari', description: 'Answer three quick questions and we suggest the room at Hotel Sea View that suits your trip.', priority: '0.5' },
  { path: '/request/group', title: 'Group and pilgrim bookings | Hotel Sea View, Kanyakumari', description: 'Bringing a tour, pilgrim or family group to Kanyakumari? Tell us your dates and numbers and our team will send a quote.', priority: '0.6' },
  { path: '/request/corporate', title: 'Corporate stays | Hotel Sea View, Kanyakumari', description: 'Company stays, conferences and team trips at Hotel Sea View, Kanyakumari. Ask for a corporate quote.', priority: '0.5' },
  { path: '/request/gift', title: 'Gift a stay | Hotel Sea View, Kanyakumari', description: 'Give someone a sunrise stay in Kanyakumari. Tell us who it is for and our team will arrange a gift voucher.', priority: '0.5' },
  { path: '/request/tour', title: 'Sightseeing and taxi | Hotel Sea View, Kanyakumari', description: 'Book sightseeing, airport and station transfers and day trips from Kanyakumari through our travel desk.', priority: '0.5' },
  { path: '/request/table', title: 'Reserve a table | Sea View Restaurant, Kanyakumari', description: 'Reserve a table at Sea View Restaurant, Hotel Sea View, Kanyakumari.', priority: '0.5' },
  { path: '/request/celebration', title: 'Birthday and anniversary set-ups | Hotel Sea View, Kanyakumari', description: 'Cake, flowers and room decoration for birthdays, anniversaries and proposals at Hotel Sea View.', priority: '0.5' },
  { path: '/request/agent', title: 'Travel agents | Hotel Sea View, Kanyakumari', description: 'Travel agents and tour operators: register with Hotel Sea View, Kanyakumari for group and agent rates.', priority: '0.4' },
  { path: '/request/callback', title: 'Request a call back | Hotel Sea View, Kanyakumari', description: 'Leave your number and a good time to call, and our team will call you back.', priority: '0.4' },
  { path: '/kanyakumari-sunrise-hotel', title: 'Hotel with sunrise view in Kanyakumari | Hotel Sea View', description: 'Watch the sunrise over three seas from your room. Sea-facing rooms at Hotel Sea View look towards the Vivekananda Rock and Thiruvalluvar Statue.', priority: '0.6' },
  { path: '/hotel-near-kanyakumari-beach', title: 'Hotel near Kanyakumari beach | Hotel Sea View', description: 'Hotel Sea View is on East Car Street, a short walk from Kanyakumari beach, the ferry point and the Bhagavathy Amman temple.', priority: '0.6' },
  { path: '/family-hotel-kanyakumari', title: 'Family hotel in Kanyakumari | Hotel Sea View', description: 'Family rooms, 24-hour room service, a multi-cuisine restaurant and free parking near the beach in Kanyakumari.', priority: '0.6' },
  { path: '/ta', title: 'ஹோட்டல் சீ வியூ, கன்னியாகுமரி | கடல் காட்சி அறைகள்', description: 'கன்னியாகுமரி கிழக்கு கார் தெருவில், கடற்கரை அருகே, சூரிய உதயம் காணும் கடல் காட்சி அறைகள்.', priority: '0.5' },
  { path: '/hi', title: 'होटल सी व्यू, कन्याकुमारी | समुद्र के नज़ारे वाले कमरे', description: 'कन्याकुमारी में ईस्ट कार स्ट्रीट पर, समुद्र तट के पास, सूर्योदय के नज़ारे वाले कमरे।', priority: '0.5' },
  { path: '/ml', title: 'ഹോട്ടൽ സീ വ്യൂ, കന്യാകുമാരി | കടൽ കാഴ്ചയുള്ള മുറികൾ', description: 'കന്യാകുമാരി ഈസ്റ്റ് കാർ സ്ട്രീറ്റിൽ, ബീച്ചിനടുത്ത്, സൂര്യോദയം കാണാവുന്ന മുറികൾ.', priority: '0.5' },
  { path: '/brochure', title: 'Brochure | Hotel Sea View, Kanyakumari', description: 'A printable one-page brochure for Hotel Sea View, Kanyakumari: rooms, dining, events and how to reach us.', priority: '0.3' },
  { path: '/brand', title: 'Brand and press | Hotel Sea View, Kanyakumari', description: 'Logo, colours and approved photos of Hotel Sea View for travel agents, press and partners.', priority: '0.3' }
);
