// Runs after `vite build`. For every public page it writes an HTML file with that page's own title,
// description, canonical address, social tags and structured data, so search engines and link previews
// see the right details before any JavaScript runs (PRD 10.1). It also writes sitemap.xml and robots.txt.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { PAGES } from '../src/data/routes.js';
import { FAQS, HOTEL, ROOMS } from '../src/data/content.js';

const SITE = (process.env.VITE_SITE_URL || 'https://seaviewhotel-8x42.vercel.app').replace(/\/$/, '');
const DIST = 'dist';
const UP = 'https://hotelseaview.in/wp-content/uploads';
const OG = `${UP}/2025/06/Hotel-Sea-View-Deluxe-Seaview-Rooms.jpg`;
const ROOM_IMG = {
  roomStandard: '2025/06/Hotel-Sea-View-Standard-Rooms.jpg',
  roomDeluxe: '2025/06/Hotel-Sea-View-Deluxe-Seaview-Rooms.jpg',
  roomCorner: '2025/07/Corner-DLX-Room.jpg',
  roomTwin: '2025/06/Hotel-Sea-View-Twin-Rooms.jpg',
  roomSuite: '2025/06/Hotel-Sea-View-Executive-Suit-Rooms.jpg',
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (p) => `${SITE}${p === '/' ? '/' : p}`;

// Only facts published by the hotel. No ratings, reviews, prices, awards or coordinates (PRD 10.1).
const hotel = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  '@id': `${SITE}/#hotel`,
  name: HOTEL.name,
  url: `${SITE}/`,
  telephone: '+91-9489474968',
  email: HOTEL.email,
  image: [OG, `${UP}/2025/07/Hotel-Sea-View-scaled.jpg`],
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

const crumbs = (p, name) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    ...(p.startsWith('/rooms/') ? [{ '@type': 'ListItem', position: 2, name: 'Rooms', item: `${SITE}/rooms` }] : []),
    { '@type': 'ListItem', position: p.startsWith('/rooms/') ? 3 : 2, name, item: url(p) },
  ],
});

function ldFor(page) {
  if (page.path === '/')
    return [
      hotel,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ];
  const name = page.title.split(' | ')[0];
  const out = [crumbs(page.path, name)];
  if (page.room) {
    const r = ROOMS.find((x) => x.id === page.room);
    out.push({
      '@context': 'https://schema.org',
      '@type': 'HotelRoom',
      name: r.name,
      description: r.summary,
      url: url(page.path),
      image: `${UP}/${ROOM_IMG[r.image]}`,
      bed: r.beds,
      containedInPlace: { '@id': `${SITE}/#hotel` },
    });
  }
  return out;
}

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

function render(page) {
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url(page.path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Hotel Sea View" />`,
    `<meta property="og:url" content="${url(page.path)}" />`,
    `<meta property="og:title" content="${esc(page.title.split(' | ')[0])}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:image" content="${page.room ? `${UP}/${ROOM_IMG[ROOMS.find((x) => x.id === page.room).image]}` : OG}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...ldFor(page).map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
  return template.replace(/<!-- seo:start -->[\s\S]*<!-- seo:end -->/, `<!-- seo:start -->\n    ${head}\n    <!-- seo:end -->`);
}

if (!/<!-- seo:start -->/.test(template)) throw new Error('index.html is missing the seo markers');

for (const page of PAGES) {
  const file = page.path === '/' ? join(DIST, 'index.html') : join(DIST, `${page.path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(page));
}

// Pages that are not public (sign-in, dashboards) fall back to this copy, marked noindex.
writeFileSync(
  join(DIST, 'app.html'),
  render({ path: '/', title: 'Hotel Sea View, Kanyakumari', description: PAGES[0].description }).replace('<!-- seo:end -->', '<meta name="robots" content="noindex" />\n    <!-- seo:end -->')
);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map(
    (p) => `  <url><loc>${url(p.path)}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`
  ).join('\n')}\n</urlset>\n`
);
writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /login\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`
);
console.log(`prerender: ${PAGES.length} pages, sitemap.xml and robots.txt for ${SITE}`);
