// Admin-panel side of the website content: rooms, offers, photos, homepage slides, page banners and
// the gallery, all stored in Firestore. Every save tells the website to refresh (see /api/revalidate).
import { fb } from './firebase';
import { SEED_OFFERS, SEED_ROOMS, SEED_SITE } from '@/data/seed';
import { PHOTOS } from '@/data/images';

// ---------- Loading ----------

export async function loadContent() {
  const { db, F } = fb();
  const [site, rooms, offers, media] = await Promise.all([
    F.getDoc(F.doc(db, 'site', 'content')),
    F.getDocs(F.collection(db, 'rooms')),
    F.getDocs(F.collection(db, 'offers')),
    F.getDocs(F.collection(db, 'media_meta')),
  ]);
  const s = site.exists() ? site.data() : null;
  const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);
  return {
    seeded: Boolean(s?.seeded),
    site: { categories: s?.categories || [], hero: s?.hero || [], gallery: s?.gallery || [], banners: s?.banners || {} },
    rooms: rooms.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder),
    offers: offers.docs.map((d) => ({ ...d.data(), code: d.id })).sort(byOrder),
    media: media.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0)),
  };
}

// ---------- Refreshing the public website ----------

export async function publishChanges() {
  try {
    const token = await fb().auth.currentUser?.getIdToken();
    if (!token) return false;
    const r = await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return r.ok;
  } catch {
    return false;
  }
}

const stamp = (me) => {
  const { F } = fb();
  return { updated_at: F.serverTimestamp(), updated_by: String(me || '').slice(0, 120) };
};

export function friendlyError(err) {
  if (err?.code === 'permission-denied') return 'Firebase refused this change. Your account may be view-only, or the latest firestore.rules are not published yet.';
  if (err?.code === 'unavailable' || err?.message?.includes('offline')) return 'No connection. Check the internet and try again.';
  if (err?.code === 'resource-exhausted') return 'The free Firebase quota for today is used up. Try again tomorrow.';
  return err?.message && err.message.length < 160 ? err.message : 'Something went wrong. Try again.';
}

// ---------- First-time import of the existing website content ----------

export async function importCurrentContent(me) {
  const { db, F } = fb();
  const batch = F.writeBatch(db);
  for (const r of SEED_ROOMS) {
    const { id, ...data } = r;
    batch.set(F.doc(db, 'rooms', id), { ...data, ...stamp(me) });
  }
  for (const o of SEED_OFFERS) batch.set(F.doc(db, 'offers', o.code), { ...o, ...stamp(me) });
  batch.set(F.doc(db, 'site', 'content'), { ...SEED_SITE, seeded: true, ...stamp(me) });
  await batch.commit();
  await publishChanges();
}

// ---------- Rooms, offers and site settings ----------

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export async function saveRoom(id, room, me) {
  const { db, F } = fb();
  const { id: _drop, ...data } = room;
  await F.setDoc(F.doc(db, 'rooms', id), clean({ ...data, ...stamp(me) }));
  await publishChanges();
}

export async function deleteRoom(id) {
  const { db, F } = fb();
  await F.deleteDoc(F.doc(db, 'rooms', id));
  await publishChanges();
}

export async function saveOffer(code, offer, me) {
  const { db, F } = fb();
  await F.setDoc(F.doc(db, 'offers', code), clean({ ...offer, code, ...stamp(me) }));
  await publishChanges();
}

export async function deleteOffer(code) {
  const { db, F } = fb();
  await F.deleteDoc(F.doc(db, 'offers', code));
  await publishChanges();
}

export async function saveSite(patch, me) {
  const { db, F } = fb();
  await F.setDoc(F.doc(db, 'site', 'content'), { ...patch, seeded: true, ...stamp(me) }, { merge: true });
  await publishChanges();
}

// ---------- Photos ----------

export const MAX_UPLOAD = 15 * 1024 * 1024; // what the admin may pick
export const MAX_STORED = 700 * 1024; // what is stored after compression
export const MAX_SIDE = 2400;
export const MIN_GOOD_WIDTH = 1200;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function checkFile(file) {
  if (!file) return 'Choose a photo first.';
  if (!TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP photo. Other formats (HEIC, GIF, PDF) are not supported.';
  if (file.size > MAX_UPLOAD) return `That file is ${(file.size / 1048576).toFixed(1)} MB. The limit is 15 MB.`;
  return '';
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file could not be opened as a photo.'));
    };
    img.src = url;
  });
}

const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

// Resize to at most 2400 px and compress (WebP, or JPEG where the browser cannot make WebP)
// until it fits the 700 KB storage limit. Returns a preview URL and details for the admin to check.
export async function preparePhoto(file) {
  const err = checkFile(file);
  if (err) throw new Error(err);
  const { img, url } = await readImage(file);
  const w0 = img.naturalWidth;
  const h0 = img.naturalHeight;
  let scale = Math.min(1, MAX_SIDE / Math.max(w0, h0));
  let blob = null;
  let w = 0;
  let h = 0;
  for (let attempt = 0; attempt < 8; attempt++) {
    w = Math.round(w0 * scale);
    h = Math.round(h0 * scale);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    for (const q of [0.86, 0.78, 0.7]) {
      blob = await toBlob(c, 'image/webp', q);
      if (!blob || blob.type !== 'image/webp') blob = await toBlob(c, 'image/jpeg', q);
      if (blob && blob.size <= MAX_STORED) break;
    }
    if (blob && blob.size <= MAX_STORED) break;
    scale *= 0.82;
  }
  URL.revokeObjectURL(url);
  if (!blob || blob.size > MAX_STORED) throw new Error('This photo could not be made small enough. Try a smaller photo.');
  const warnings = [];
  if (w0 < MIN_GOOD_WIDTH) warnings.push(`This photo is only ${w0} px wide, so it may look soft on large screens. 1600 px or wider is best.`);
  return { blob, preview: URL.createObjectURL(blob), w, h, size: blob.size, mime: blob.type, name: file.name.slice(0, 120), original: { w: w0, h: h0, size: file.size }, warnings };
}

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Could not read the photo.'));
    r.readAsDataURL(blob);
  });

const newId = () => {
  const a = crypto.getRandomValues(new Uint8Array(15));
  return Array.from(a, (b) => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 62]).join('');
};

// Saves a prepared photo; returns its reference ('m:<id>') for rooms, offers, slides, banners and the gallery.
export async function savePhoto(prepared, { alt = '' } = {}, me) {
  const { db, F } = fb();
  const id = newId();
  const data = await blobToBase64(prepared.blob);
  const info = { mime: prepared.mime, name: prepared.name, w: prepared.w, h: prepared.h, size: prepared.size, alt: alt.slice(0, 200), created_at: F.serverTimestamp(), created_by: String(me || '').slice(0, 120) };
  // The photo itself first, then the light listing entry used by the photo library.
  await F.setDoc(F.doc(db, 'media', id), { ...info, data });
  await F.setDoc(F.doc(db, 'media_meta', id), info);
  return `m:${id}`;
}

export async function updatePhotoAlt(id, alt) {
  const { db, F } = fb();
  await Promise.all([F.updateDoc(F.doc(db, 'media_meta', id), { alt: alt.slice(0, 200) }), F.updateDoc(F.doc(db, 'media', id), { alt: alt.slice(0, 200) })]);
}

// Where a photo is used, in words, so nothing is deleted while a page still shows it.
export function photoUsage(ref, content) {
  const where = [];
  for (const r of content.rooms) if ((r.images || []).includes(ref)) where.push(`Room: ${r.name}`);
  for (const o of content.offers) if (o.image === ref) where.push(`Offer: ${o.title}`);
  content.site.hero.forEach((h, i) => h.image === ref && where.push(`Homepage slide ${i + 1}`));
  for (const [slot, v] of Object.entries(content.site.banners || {})) if (v === ref) where.push(`Banner: ${slot}`);
  if (content.site.gallery.some((g) => g.image === ref)) where.push('Gallery');
  return where;
}

// Swap one photo for another everywhere it is used (replace), or remove it everywhere (to = null).
export async function swapPhotoEverywhere(from, to, content, me) {
  const { db, F } = fb();
  const batch = F.writeBatch(db);
  let n = 0;
  for (const r of content.rooms) {
    if (!(r.images || []).includes(from)) continue;
    const images = r.images.map((x) => (x === from ? to : x)).filter(Boolean);
    batch.update(F.doc(db, 'rooms', r.id), { images, ...stamp(me) });
    n++;
  }
  for (const o of content.offers) {
    if (o.image !== from) continue;
    batch.update(F.doc(db, 'offers', o.code), { image: to || '', ...stamp(me) });
    n++;
  }
  const s = content.site;
  const hero = s.hero.map((h) => (h.image === from ? { ...h, image: to } : h)).filter((h) => h.image);
  const gallery = s.gallery.map((g) => (g.image === from ? { ...g, image: to } : g)).filter((g) => g.image);
  const banners = Object.fromEntries(Object.entries(s.banners || {}).map(([k, v]) => [k, v === from ? to : v]).filter(([, v]) => v));
  if (JSON.stringify([hero, gallery, banners]) !== JSON.stringify([s.hero, s.gallery, s.banners || {}])) {
    batch.set(F.doc(db, 'site', 'content'), { hero, gallery, banners, seeded: true, ...stamp(me) }, { merge: true });
    n++;
  }
  if (n) await batch.commit();
  return n;
}

export async function deletePhoto(id) {
  const { db, F } = fb();
  await F.deleteDoc(F.doc(db, 'media_meta', id));
  await F.deleteDoc(F.doc(db, 'media', id));
}

// Photos built into the website (the hotel's own HD set), offered alongside uploads.
export const BUILT_IN = Object.entries(PHOTOS)
  .filter(([k]) => !['tourPoster'].includes(k))
  .map(([k, p]) => ({ ref: k, src: p.src, alt: p.alt, w: p.width, h: p.height }));
