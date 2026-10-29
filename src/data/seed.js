// The website's content in the shape the admin panel stores it in Firestore. Used once to copy the
// existing content into the database ("Import the current website content" in the admin panel), and as
// the content shown before that import has been done. After the import, Firestore is the only source.
import { GALLERY, HERO_SLIDES, OFFERS, ROOM_GROUPS, ROOMS } from './content.js';

const AMENITIES_BY_ROOM = {
  standard: ['city_view', 'bathroom', 'tv', 'phone', 'room_service', 'work_area'],
  'deluxe-seaview': ['sea_view', 'sunrise', 'bathroom', 'tv', 'phone', 'room_service', 'work_area'],
  'corner-deluxe': ['sea_view', 'sunrise', 'bathroom', 'tv', 'phone', 'room_service'],
  twin: ['sea_view', 'city_view', 'balcony', 'interconnecting', 'bathroom', 'tv', 'phone', 'room_service'],
  'executive-suite': ['sea_view', 'sunrise', 'bathroom', 'tv', 'phone', 'room_service', 'work_area'],
};
const EXTRA_IMAGES = { 'deluxe-seaview': ['seaView'], 'executive-suite': ['vivekananda'] };
const GUESTS = { twin: 8 };

export const SEED_CATEGORIES = [
  { id: 'sea-view', title: ROOM_GROUPS[0].title, text: ROOM_GROUPS[0].text },
  { id: 'city-family', title: ROOM_GROUPS[1].title, text: ROOM_GROUPS[1].text },
];

export const SEED_ROOMS = ROOMS.map((r, i) => ({
  id: r.id,
  name: r.name,
  category: ROOM_GROUPS[0].rooms.includes(r.id) ? 'sea-view' : 'city-family',
  summary: r.summary,
  description: r.summary,
  view: r.view,
  beds: r.beds,
  occupancy: r.occupancy,
  guests: GUESTS[r.id] || 4,
  size: r.size || '',
  rate: r.rate ?? null,
  features: r.features,
  amenities: AMENITIES_BY_ROOM[r.id] || ['bathroom', 'tv', 'phone', 'room_service'],
  images: [r.image, ...(EXTRA_IMAGES[r.id] || [])],
  order: i + 1,
  published: true,
}));

export const SEED_OFFERS = OFFERS.map((o, i) => ({
  code: o.code,
  title: o.title,
  tag: o.tag || '',
  text: o.text,
  includes: o.includes || [],
  image: o.image,
  room: o.room || '',
  type: o.type || 'stay',
  order: i + 1,
  published: true,
}));

export const SEED_SITE = {
  categories: SEED_CATEGORIES,
  hero: HERO_SLIDES.map((h) => ({ image: h.image, caption: h.caption })),
  gallery: GALLERY.map((g) => ({ image: g.image, cat: g.cat, alt: '' })),
  banners: {},
};
