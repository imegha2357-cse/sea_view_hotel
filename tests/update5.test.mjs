// Tests for the update-5 features: sunrise countdown, lists, request forms, page metadata,
// landing pages, chat live facts and handover text.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { nextSunrise } from '../src/lib/sun.js';
import { GEO, GUIDES } from '../src/data/content.js';
import { LISTS, LIST_IDS, REQUEST_TYPES, THEMES, THEME_TEXT } from '../src/data/lists.js';
import { REQUEST_FORMS, REQUEST_SLUGS } from '../src/data/requests.js';
import { PAGES } from '../src/data/routes.js';
import { LANDING } from '../src/data/landing.js';
import { localAnswer, setLiveFacts, knowledgeText } from '../src/lib/hotel-knowledge.js';

test('next sunrise is always within the next 25 hours', () => {
  for (let h = 0; h < 48; h += 3) {
    const s = nextSunrise(GEO, new Date(Date.UTC(2026, 9, 30, h)));
    assert.ok(s.ms > 0 && s.ms < 25 * 3600e3, `hour ${h}: ${s.ms}`);
    assert.match(s.at, /^\d{1,2}:\d{2} am$/);
  }
});

test('every list has a unique id and at least one required field', () => {
  assert.equal(new Set(LIST_IDS).size, LISTS.length);
  for (const l of LISTS) assert.ok(l.fields.some((f) => f.required), l.id);
});

test('list ids match the ones allowed in firestore.rules', async () => {
  const { readFileSync } = await import('node:fs');
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  for (const id of LIST_IDS) assert.ok(rules.includes(`'${id}'`), `${id} missing from rules`);
  for (const t of Object.keys(REQUEST_TYPES)) assert.ok(rules.includes(`'${t}'`), `${t} missing from rules`);
  for (const [t] of THEMES) assert.ok(rules.includes(`'${t}'`), `theme ${t} missing from rules`);
});

test('every festival theme except "none" has a greeting', () => {
  for (const [t] of THEMES) if (t !== 'none') assert.ok(THEME_TEXT[t], t);
});

test('every request form has a title, an intro, a photo and page metadata', () => {
  for (const s of REQUEST_SLUGS) {
    const f = REQUEST_FORMS[s];
    assert.ok(f.title && f.intro && f.image && f.fields.length, s);
    assert.ok(REQUEST_TYPES[s], `${s} has no label`);
    assert.ok(PAGES.some((p) => p.path === `/request/${s}`), `${s} has no metadata`);
  }
});

test('page titles are unique and descriptions are short', () => {
  const titles = PAGES.map((p) => p.title);
  assert.equal(new Set(titles).size, titles.length);
  for (const p of PAGES) assert.ok(p.description.length <= 170, `${p.path} description too long`);
});

test('landing pages have metadata, copy and photos', () => {
  for (const [path, c] of Object.entries(LANDING)) {
    assert.ok(PAGES.some((p) => p.path === path), path);
    assert.ok(c.sections.length >= 3 && c.photos.length >= 3 && c.cta, path);
  }
});

test('guides have unique slugs and a body', () => {
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, GUIDES.length);
  assert.ok(GUIDES.length >= 6);
  for (const g of GUIDES) assert.ok(g.body.length >= 4, g.slug);
});

test('the assistant uses check-in times and policies from the admin panel', () => {
  setLiveFacts({});
  assert.match(localAnswer('what time is check in').answer || localAnswer('what time is check in'), /ask|confirm/i);
  setLiveFacts({ checkIn: '12 noon', checkOut: '11 am', policies: [{ title: 'Pets', text: 'Pets are not allowed.' }] });
  const a = localAnswer('what time is check in');
  assert.match(a.answer || a, /12 noon/);
  const k = knowledgeText([]);
  assert.match(k, /Pets: Pets are not allowed\./);
  assert.ok(!/Pets: Please ask the hotel/.test(k), 'old pets policy should be replaced');
  setLiveFacts({});
});
