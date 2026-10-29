// Reads the website content (rooms, offers, photos) from Firestore on the server, through its public
// REST API, so pages are built as static HTML and refreshed when the admin saves (see /api/revalidate).
// Before the admin has imported the content, the starter content in src/data/seed.js is shown.
import 'server-only';
import { config } from './firebase';
import { SEED_OFFERS, SEED_ROOMS, SEED_SITE } from '@/data/seed';
import { BANNER_SLOTS } from '@/data/catalog';

const BASE = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
const OPTS = { next: { revalidate: 600, tags: ['cms'] } };

// Firestore's typed JSON → plain values.
function val(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
  if ('mapValue' in v) return fields(v.mapValue.fields);
  return null;
}
const fields = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, val(v)]));
const docId = (name) => name.split('/').pop();

async function getDoc(path) {
  const r = await fetch(`${BASE}/${path}?key=${config.apiKey}`, OPTS);
  if (r.status === 404 || r.status === 403) return null; // 403: content rules not published yet
  if (!r.ok) throw new Error(`Firestore ${r.status}`);
  return fields((await r.json()).fields);
}
async function listDocs(col) {
  const r = await fetch(`${BASE}/${col}?key=${config.apiKey}&pageSize=200`, OPTS);
  if (!r.ok) throw new Error(`Firestore ${r.status}`);
  const j = await r.json();
  return (j.documents || []).map((d) => ({ id: docId(d.name), ...fields(d.fields) }));
}

// When a page is refreshed on Vercel and Firestore cannot be reached, the read throws so the last good
// copy of the page stays up. During a build (no earlier copy) and locally, the starter content is used.
const offline = (e) => {
  if (process.env.VERCEL && process.env.NEXT_PHASE !== 'phase-production-build') throw e;
  console.warn('Website content: using the starter content because Firestore could not be read.', e?.message);
  return null;
};

const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99) || String(a.name || a.title).localeCompare(String(b.name || b.title));

export async function getSite() {
  const site = await getDoc('site/content').catch(offline);
  const s = site?.seeded ? site : { ...SEED_SITE, seeded: false };
  return {
    seeded: Boolean(s.seeded),
    categories: s.categories?.length ? s.categories : SEED_SITE.categories,
    hero: (s.hero || []).filter((h) => h?.image),
    gallery: (s.gallery || []).filter((g) => g?.image),
    banners: s.banners || {},
  };
}

export async function getRooms({ all = false } = {}) {
  const site = await getSite();
  if (!site.seeded) return SEED_ROOMS;
  const rooms = (await listDocs('rooms').catch(offline)) ?? SEED_ROOMS;
  return rooms
    .filter((r) => all || r.published !== false)
    .map((r) => ({ ...r, images: (r.images || []).filter(Boolean), features: r.features || [], amenities: r.amenities || [] }))
    .sort(byOrder);
}

export async function getRoom(id) {
  return (await getRooms()).find((r) => r.id === id) || null;
}

export async function getOffers() {
  const site = await getSite();
  if (!site.seeded) return SEED_OFFERS;
  const offers = (await listDocs('offers').catch(offline)) ?? SEED_OFFERS;
  return offers.filter((o) => o.published !== false).sort(byOrder);
}

export async function getBanner(slot) {
  const site = await getSite();
  return site.banners?.[slot] || BANNER_SLOTS.find((b) => b.id === slot)?.fallback || 'building';
}

// Everything the header, forms and account pages need, in one call.
export async function getSiteData() {
  const [rooms, offers, site] = await Promise.all([getRooms(), getOffers(), getSite()]);
  return {
    rooms: rooms.map((r) => ({ id: r.id, name: r.name, image: r.images[0] || null, rate: r.rate ?? null, category: r.category })),
    offers: offers.map((o) => ({ code: o.code, title: o.title, image: o.image, room: o.room || '', type: o.type || 'stay' })),
    categories: site.categories,
  };
}
