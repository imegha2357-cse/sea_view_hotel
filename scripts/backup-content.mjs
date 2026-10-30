// Saves the public website content from Firestore as JSON files (used by the daily backup workflow).
// Only collections the website itself reads are saved; guest enquiries and accounts are not.
// Usage: node scripts/backup-content.mjs <out-dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT = process.env.FIREBASE_PROJECT_ID || 'sea-view-hotel';
const KEY = process.env.FIREBASE_API_KEY ? `key=${process.env.FIREBASE_API_KEY}&` : '';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const out = process.argv[2] || 'backup';

const val = (v) => {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
  if ('mapValue' in v) return obj(v.mapValue.fields);
  return null;
};
const obj = (f = {}) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, val(v)]));
const id = (name) => name.split('/').pop();

async function list(col) {
  const docs = [];
  let token = '';
  do {
    const r = await fetch(`${BASE}/${col}?${KEY}pageSize=300${token ? `&pageToken=${token}` : ''}`);
    if (!r.ok) throw new Error(`${col}: ${r.status}`);
    const j = await r.json();
    for (const d of j.documents || []) docs.push({ id: id(d.name), ...obj(d.fields) });
    token = j.nextPageToken || '';
  } while (token);
  return docs;
}
async function one(path) {
  const r = await fetch(`${BASE}/${path}?${KEY}`.replace(/\?$/, ''));
  return r.ok ? obj((await r.json()).fields) : null;
}
async function published() {
  const r = await fetch(`${BASE}:runQuery?${KEY}`.replace(/\?$/, ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'posts' }], where: { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } } } }),
  });
  if (!r.ok) return [];
  return (await r.json()).filter((x) => x.document).map((x) => ({ id: id(x.document.name), ...obj(x.document.fields) }));
}

mkdirSync(out, { recursive: true });
const save = (name, data) => writeFileSync(join(out, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);
const jobs = {
  'site-content': () => one('site/content'),
  'site-settings': () => one('site/settings'),
  'availability': () => one('settings/availability'),
  rooms: () => list('rooms'),
  offers: () => list('offers'),
  lists: () => list('lists'),
  posts: published,
  inventory: () => list('inventory'),
  'photo-library': () => list('media_meta'),
};
let failed = 0;
for (const [name, fn] of Object.entries(jobs)) {
  try {
    const data = await fn();
    save(name, data);
    console.log(`saved ${name}${Array.isArray(data) ? ` (${data.length})` : ''}`);
  } catch (e) {
    failed++;
    console.error(`could not save ${name}: ${e.message}`);
  }
}
save('README', { note: 'Daily copy of the public website content. Photos themselves are in the media collection and are not copied here.', saved_at: new Date().toISOString() });
if (failed === Object.keys(jobs).length) process.exit(1);
