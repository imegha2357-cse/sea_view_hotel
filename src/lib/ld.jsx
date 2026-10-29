// Structured data (schema.org) built only from facts the hotel has published (PRD 10.1):
// no ratings, review counts, prices, awards or coordinates.
import { FAQS, HOTEL, ROOMS } from '@/data/content';
import { PHOTOS } from '@/data/images';
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

export const roomLd = (id) => {
  const r = ROOMS.find((x) => x.id === id);
  return {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: r.name,
    description: r.summary,
    url: `${SITE_URL}/rooms/${r.id}`,
    image: abs(PHOTOS[r.image].src),
    bed: r.beds,
    containedInPlace: { '@id': `${SITE_URL}/#hotel` },
  };
};

export function JsonLd({ data }) {
  const list = Array.isArray(data) ? data : [data];
  return list.map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }} />);
}
