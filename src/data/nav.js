// Header and footer structure, modelled on the Taj layout but pointing only at things Hotel Sea View has.
import { ATTRACTIONS, HOTEL, ROOMS } from './content.js';

export const MAIN_NAV = [
  {
    id: 'stay',
    label: 'Stay',
    href: '/rooms',
    // Image tiles, like the Taj "Memberships" panel
    tiles: ROOMS.map((r) => ({ label: r.name, href: `/rooms/${r.id}`, image: r.image })),
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
  { id: 'offers', label: 'Offers', href: '/offers' },
  { id: 'events', label: 'Events', href: '/meetings' },
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
      ],
      [
        { label: 'About the hotel', href: '/about' },
        { label: 'Hotel policies', href: '/policies' },
        { label: 'Frequently asked questions', href: '/policies#faqs' },
        { label: 'Contact us', href: '/contact' },
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
  ],
  [
    { label: 'About the hotel', href: '/about' },
    { label: 'Offers', href: '/offers' },
    { label: 'Plan your visit', href: '/plan-your-visit' },
    { label: 'Hotel policies', href: '/policies' },
    { label: 'FAQs', href: '/policies#faqs' },
    { label: 'Contact us', href: '/contact' },
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
