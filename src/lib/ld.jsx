// Structured data (schema.org) built only from facts the hotel has published (PRD 10.1):
// no ratings, review counts, prices, awards or coordinates.
import { FAQS, HOTEL } from '@/data/content';
import { PHOTOS, photoUrl } from '@/data/images';
import { SITE_URL } from '@/data/site';

const abs = (src) => `${SITE_URL}${src}`;

export const hotelLd = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': `${SITE_URL}/#hotel`,
  name: HOTEL.name,
  url: `${SITE_URL}/`,
  telephone: '+91-9489474968',
  email: HOTEL.email,
  image: [abs(PHOTOS.building.src), abs(PHOTOS.roomDeluxe.src)],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'East Car Street',
    addressLocality: 'Kanyakumari',
    addressRegion: 'Tamil Nadu',
    postalCode: '629702',
    addressCountry: 'IN',
  },
  amenityFeature: ['Free parking', '24-hour room service', 'Restaurant', 'Bar', 'Conference hall', 'Travel desk'].map((name) => ({
    '@type': 'LocationFeatureSpecification',
    name,
    value: true,
  })),
  sameAs: [HOTEL.facebook],
};

export const faqLd = (items = FAQS) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const crumbsLd = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ label: 'Home', href: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, item: `${SITE_URL}${t.href}` })),
});

export const roomLd = (r) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: r.name,
    description: r.summary || r.description || undefined,
    url: `${SITE_URL}/rooms/${r.id}`,
    image: photoUrl(r.images?.[0], SITE_URL) || undefined,
    bed: r.beds || undefined,
    containedInPlace: { '@id': `${SITE_URL}/#hotel` },
  };
};

export function JsonLd({ data }) {
  const list = Array.isArray(data) ? data : [data];
  return list.map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />);
}

// Sea View Restaurant, part of the hotel (dining page).
export const restaurantLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': `${SITE_URL}/dining#restaurant`,
  name: 'Sea View Restaurant',
  servesCuisine: ['Indian', 'Chinese', 'Continental'],
  telephone: '+91-7695959109',
  url: `${SITE_URL}/dining`,
  hasMenu: `${SITE_URL}/dining/menu`,
  acceptsReservations: `${SITE_URL}/request/table`,
  containedInPlace: { '@id': `${SITE_URL}/#hotel` },
  address: hotelLd.address,
};

// Menu built from the admin-managed dishes (only names and sections; prices only when given).
export const menuLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: 'Sea View Restaurant menu',
  url: `${SITE_URL}/dining/menu`,
  hasMenuSection: [...new Set(items.map((i) => i.section || 'Menu'))].map((s) => ({
    '@type': 'MenuSection',
    name: s,
    hasMenuItem: items
      .filter((i) => (i.section || 'Menu') === s)
      .map((i) => ({ '@type': 'MenuItem', name: i.name, ...(i.note ? { description: i.note } : {}), ...(i.price && /^\d+$/.test(String(i.price).replace(/[₹,\s]/g, '')) ? { offers: { '@type': 'Offer', price: String(i.price).replace(/[₹,\s]/g, ''), priceCurrency: 'INR' } } : {}) })),
  })),
});

// Hotel facts with the social profiles from the admin panel added to sameAs.
export const hotelLdWith = (social = {}) => ({ ...hotelLd, sameAs: [...new Set([HOTEL.facebook, ...Object.values(social).filter((u) => /^https:\/\//.test(u))])] });
