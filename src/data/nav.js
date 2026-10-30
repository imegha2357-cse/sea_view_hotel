// Header and footer structure, modelled on the Taj layout but pointing only at things Hotel Sea View has.
import { ATTRACTIONS, HOTEL } from './content.js';
import { waRequest } from './wa-requests.js';

// Rooms and offers come from the admin panel, so the menu is built from the live data.
export const buildNav = ({ rooms = [], offers = [] } = {}) => [
  {
    id: 'stay',
    label: 'Stay',
    href: '/rooms',
    // Image tiles, like the Taj "Memberships" panel
    tiles: rooms.slice(0, 6).map((r) => ({ label: r.name, href: `/rooms/${r.id}`, image: r.image })),
  },
  {
    id: 'dining',
    label: 'Dining',
    href: '/dining',
    columns: [
      [
        { label: 'Sea View Restaurant', href: '/dining#restaurant' },
        { label: 'Wave Bar', href: '/dining#bar' },
        { label: '24-hour room service', href: '/dining#room-service' },
      ],
    ],
    tiles: [
      { label: 'Sea View Restaurant', href: '/dining#restaurant', image: 'restaurant1' },
      { label: 'Wave Bar', href: '/dining#bar', image: 'bar1' },
    ],
  },
  {
    id: 'experiences',
    label: 'Experiences',
    href: '/experiences',
    tiles: ATTRACTIONS.slice(0, 5).map((a) => ({ label: a.name, href: `/experiences#${slug(a.name)}`, image: a.image })),
  },
  {
    id: 'offers',
    label: 'Offers',
    href: '/offers',
    tiles: offers.slice(0, 5).map((o) => ({ label: o.title, href: `/offers#${o.code.toLowerCase()}`, image: o.image })),
  },
  {
    id: 'events',
    label: 'Events',
    href: '/meetings',
    columns: [
      [
        { label: 'Weddings and receptions', href: '/meetings#weddings' },
        { label: 'Engagements', href: '/meetings#engagements' },
        { label: 'Birthdays and anniversaries', href: '/meetings#birthdays' },
        { label: 'Family get-togethers', href: '/meetings#reunions' },
      ],
      [
        { label: 'Business meetings', href: '/meetings#meetings' },
        { label: 'Training and seminars', href: '/meetings#training' },
        { label: 'Tour and pilgrimage groups', href: '/meetings#groups' },
        { label: 'Plan your event', href: '/meetings#plan', arrow: true },
      ],
    ],
    tiles: [{ label: 'Conference hall', href: '/meetings', image: 'meeting' }],
  },
  {
    id: 'more',
    label: 'More',
    columns: [
      [
        { label: 'Meetings and conferences', href: '/meetings' },
        { label: 'Weddings and family events', href: '/meetings#weddings' },
        { label: 'Plan your visit', href: '/plan-your-visit' },
        { label: 'Gallery', href: '/gallery' },
        { label: 'Room tour video', href: '/room-tour' },
        { label: 'Kanyakumari guides', href: '/guides' },
      ],
      [
        { label: 'About the hotel', href: '/about' },
        { label: 'Hotel policies', href: '/policies' },
        { label: 'Frequently asked questions', href: '/policies#faqs' },
        { label: 'Contact us', href: '/contact' },
    { label: 'Group and pilgrim bookings', href: waRequest('group') },
    { label: 'Corporate stays', href: waRequest('corporate') },
    { label: 'Gift a stay', href: waRequest('gift') },
    { label: 'Request a call back', href: waRequest('callback') },
    { label: 'News', href: '/news' },
        { label: 'Manage my enquiry', href: '/account', arrow: true },
      ],
    ],
  },
];

// Gold panel on the left of every dropdown (Taj's "Book direct offers" block), with an honest message.
export const MENU_PROMO = {
  title: 'Enquire direct',
  text: 'Speak to our team on WhatsApp or send an enquiry. Free, with no obligation.',
  href: '/enquire',
  cta: 'Enquire',
};

export const FOOTER_LINKS = [
  [
    { label: 'Rooms and suites', href: '/rooms' },
    { label: 'Dining', href: '/dining' },
    { label: 'Experiences', href: '/experiences' },
    { label: 'Meetings and events', href: '/meetings' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Room tour video', href: '/room-tour' },
    { label: 'Kanyakumari guides', href: '/guides' },
    { label: 'Restaurant menu', href: '/dining/menu' },
    { label: 'Compare rooms', href: '/rooms/compare' },
    { label: 'Help me choose a room', href: '/room-finder' },
  ],
  [
    { label: 'About the hotel', href: '/about' },
    { label: 'Offers', href: '/offers' },
    { label: 'Plan your visit', href: '/plan-your-visit' },
    { label: 'Hotel policies', href: '/policies' },
    { label: 'FAQs', href: '/policies#faqs' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Group and pilgrim bookings', href: waRequest('group') },
    { label: 'Corporate stays', href: waRequest('corporate') },
    { label: 'Gift a stay', href: waRequest('gift') },
    { label: 'Request a call back', href: waRequest('callback') },
    { label: 'News', href: '/news' },
  ],
];

export const LEGAL_LINKS = [
  { label: 'Privacy notice', href: '/privacy' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Hotel policies', href: '/policies' },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'Staff sign in', href: '/admin/login' },
];

// Only the social profile the hotel actually publishes.
export const SOCIAL = [{ label: 'Facebook', href: HOTEL.facebook, icon: 'facebook' }];

export function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
