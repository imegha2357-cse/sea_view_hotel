// The chat assistant's reasoning. It reads the visitor's message for details (dates, number of guests,
// rooms, preferences), remembers them through the conversation, and then:
//  - recommends rooms that fit the group and what they care about, explaining why,
//  - compares rooms and answers "does it have…?" questions about a room,
//  - helps put an enquiry together (asks for what is missing, checks the nights the hotel has marked
//    fully booked, and prepares a pre-filled WhatsApp message and enquiry form),
//  - works out sunrise and sunset for any date,
//  - answers several questions in one message,
// and otherwise falls back to the topic answers in hotel-knowledge.js. It never invents prices,
// availability or policies: anything unconfirmed goes to the hotel's team on WhatsApp.
import { GEO, HOTEL } from '../data/content.js';
import { sunOn } from './sun.js';
import { INTENTS, OFF_TOPIC, PRICE_WORDS, WEIGHT, amenityLabel, has, localAnswer, norm } from './hotel-knowledge.js';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, a: 1, an: 1, single: 1 };
const toNum = (w) => (/^\d+$/.test(w) ? +w : NUM[w] ?? null);
const NUMW = '(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';

// ---------- Dates (hotel time, India) ----------
const pad = (n) => String(n).padStart(2, '0');
export const todayIST = (now = new Date()) => {
  const d = new Date(now.getTime() + 5.5 * 3600e3);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
const toISO = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export const addDays = (iso, n) => toISO(new Date(toDate(iso).getTime() + n * 864e5));
const nightsBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5);
export const fmtDay = (iso) => {
  const d = toDate(iso);
  return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]} ${d.getUTCDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]}`;
};
function make(y, m, d, today, explicitYear) {
  if (m < 0 || m > 11 || d < 1 || d > 31) return null;
  let iso = `${y}-${pad(m + 1)}-${pad(d)}`;
  if (toISO(toDate(iso)) !== iso) return null; // e.g. 31 Feb
  if (!explicitYear && iso < today) iso = `${y + 1}-${pad(m + 1)}-${pad(d)}`;
  return iso;
}

export function parseDates(text, now = new Date()) {
  const t = ` ${String(text).toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ')} `;
  const today = todayIST(now);
  const y = +today.slice(0, 4);
  const found = []; // { at, iso }
  const add = (at, iso) => iso && !found.some((f) => f.iso === iso && Math.abs(f.at - at) < 3) && found.push({ at, iso });
  const mon = `(${MONTHS.join('|')})[a-z]*`;
  let m;
  // "5 to 8 dec", "5-8 december"
  for (const r of t.matchAll(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:-|to|till|until|and)\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${mon}`, 'g'))) {
    const mm = MONTHS.indexOf(r[3]);
    add(r.index, make(y, mm, +r[1], today));
    add(r.index + 1, make(y, mm, +r[2], today));
  }
  for (const r of t.matchAll(/(\d{4})-(\d{1,2})-(\d{1,2})/g)) add(r.index, make(+r[1], +r[2] - 1, +r[3], today, true));
  for (const r of t.matchAll(/(?<![\d-])(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?(?![\d])/g)) {
    const yy = r[3] ? (r[3].length === 2 ? 2000 + +r[3] : +r[3]) : y;
    add(r.index, make(yy, +r[2] - 1, +r[1], today, Boolean(r[3])));
  }
  for (const r of t.matchAll(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${mon}(?:\\s+(\\d{4}))?`, 'g'))) add(r.index, make(r[3] ? +r[3] : y, MONTHS.indexOf(r[2]), +r[1], today, Boolean(r[3])));
  for (const r of t.matchAll(new RegExp(`${mon}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?`, 'g'))) add(r.index, make(r[3] ? +r[3] : y, MONTHS.indexOf(r[1]), +r[2], today, Boolean(r[3])));
  if ((m = /day after tomorrow/.exec(t))) add(m.index, addDays(today, 2));
  else if ((m = /\btomorrow\b/.exec(t))) add(m.index, addDays(today, 1));
  if ((m = /\b(today|tonight)\b/.exec(t))) add(m.index, today);
  let weekend = false;
  if ((m = /\b(this|next|coming)?\s*weekend\b/.exec(t))) {
    const dow = toDate(today).getUTCDay();
    let sat = addDays(today, (6 - dow + 7) % 7);
    if (m[1] === 'next' && (6 - dow + 7) % 7 < 7) sat = addDays(sat, 7);
    add(m.index, sat);
    weekend = true;
  }
  for (const r of t.matchAll(/\b(?:(next|this|coming|on)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/g)) {
    const want = DAYS.indexOf(r[2]);
    const dow = toDate(today).getUTCDay();
    let diff = (want - dow + 7) % 7 || 7;
    if (r[1] === 'next' && diff < 7 && want <= dow) diff += 0;
    add(r.index, addDays(today, diff));
  }
  found.sort((a, b) => a.at - b.at);
  const dates = [...new Set(found.map((f) => f.iso))];
  const nm = new RegExp(`${NUMW}\\s+nights?|(?:a|one)\\s+night|night\\s+stay`).exec(t);
  const nights = nm ? (nm[1] ? toNum(nm[1]) : 1) : null;
  let from = dates[0] || null;
  let to = dates[1] || null;
  if (from && to && to <= from) to = null;
  if (from && !to && nights) to = addDays(from, nights);
  if (from && !to && weekend) to = addDays(from, 1);
  return { from, to, nights: from && to ? nightsBetween(from, to) : nights, mentioned: dates.length > 0 };
}

// ---------- Guests ----------
export function parseGuests(text) {
  const t = ` ${String(text).toLowerCase()} `;
  let adults = null;
  let children = null;
  let total = null;
  let m;
  if ((m = new RegExp(`${NUMW}\\s+(?:adults?|grown[- ]?ups?)`).exec(t))) adults = toNum(m[1]);
  if ((m = new RegExp(`${NUMW}\\s+(?:kids?|children|childrens|child|babies|baby|infants?)`).exec(t))) children = toNum(m[1]);
  else if (/\bwith (?:a|my|our) (?:kid|child|baby|son|daughter)\b/.test(t)) children = 1;
  if ((m = new RegExp(`${NUMW}\\s+(?:people|persons?|pax|guests?|members|of us|travell?ers)`).exec(t))) total = toNum(m[1]);
  if ((m = new RegExp(`(?:family|group) of ${NUMW}`).exec(t))) total = toNum(m[1]);
  if ((m = new RegExp(`\\bwe are ${NUMW}\\b`).exec(t))) total = toNum(m[1]);
  if (adults == null && total == null && /\b(couple|my (wife|husband|partner|fianc[eé]e?)|honeymoon|two of us|both of us)\b/.test(t)) adults = 2;
  if (adults == null && total == null && /\b(alone|solo|just me|by myself|single traveller)\b/.test(t)) adults = 1;
  if (adults == null && total != null) adults = Math.max(1, total - (children || 0));
  if (adults == null && children == null) return null;
  return { adults: adults ?? null, children: children ?? 0, total: (adults || 0) + (children || 0) };
}

// ---------- Rooms ----------
const STOP = new Set(['room', 'rooms', 'the', 'and', 'with', 'interconnected', 'of']);
function nameWords(r) {
  return norm(String(r.name).replace(/[()]/g, ' '))
    .split(' ')
    .filter((w) => w && !STOP.has(w));
}
export function roomsMentioned(text, rooms) {
  const q = ` ${norm(text)} `;
  const freq = {};
  rooms.forEach((r) => nameWords(r).forEach((w) => (freq[w] = (freq[w] || 0) + 1)));
  const scored = rooms
    .map((r) => ({ r, s: nameWords(r).reduce((n, w) => n + (q.includes(` ${w} `) || q.includes(` ${w}s `) ? 1 / freq[w] : 0), 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  if (!scored.length) return [];
  // Two or more clearly named rooms (for comparisons), otherwise the best match.
  const clear = scored.filter((x) => x.s >= 1);
  if (clear.length >= 2) return clear.map((x) => x.r);
  if (scored.length > 1 && scored[0].s === scored[1].s) return []; // ambiguous ("deluxe")
  return [scored[0].r];
}
const capacity = (r) => {
  if (r.guests) return +r.guests;
  const nums = String(r.occupancy || '').match(/\d+/g);
  return nums ? nums.reduce((a, b) => a + +b, 0) : 2;
};
const amen = (r, id) => (r.amenities || []).includes(id);
const feat = (r, re) => (r.features || []).some((f) => re.test(f)) || re.test(`${r.summary || ''} ${r.description || ''}`);

const ATTRS = [
  { id: 'balcony', words: ['balcony', 'balconies'], test: (r) => amen(r, 'balcony') || feat(r, /balcon/i), label: 'a balcony' },
  { id: 'sea', words: ['sea view', 'seaview', 'sea facing', 'sea-facing', 'ocean', 'see the sea', 'face the sea', 'view of the sea'], test: (r) => amen(r, 'sea_view') || /sea/i.test(r.view || ''), label: 'a sea view' },
  { id: 'sunrise', words: ['sunrise'], test: (r) => amen(r, 'sunrise') || feat(r, /sunrise/i), label: 'a sunrise view' },
  { id: 'tv', words: ['tv', 'television'], test: (r) => amen(r, 'tv') || feat(r, /television|tv/i), label: 'a television' },
  { id: 'work', words: ['work area', 'desk', 'workspace', 'laptop', 'work'], test: (r) => amen(r, 'work_area') || feat(r, /work area|desk/i), label: 'a work area' },
  { id: 'bath', words: ['bathroom', 'toilet', 'shower', 'washroom', 'attached bath'], test: (r) => amen(r, 'bathroom') || feat(r, /bathroom/i), label: 'a private bathroom' },
  { id: 'phone', words: ['phone', 'telephone'], test: (r) => amen(r, 'phone') || feat(r, /phone/i), label: 'a direct-dial phone' },
  { id: 'ac', words: ['ac', 'a c', 'air condition', 'air conditioned', 'air conditioning', 'aircon'], test: (r) => amen(r, 'ac'), label: 'air-conditioning' },
  { id: 'wifi', words: ['wifi', 'wi-fi', 'internet'], test: (r) => amen(r, 'wifi'), label: 'Wi-Fi' },
  { id: 'connect', words: ['interconnecting', 'interconnected', 'connecting door', 'connected rooms'], test: (r) => amen(r, 'interconnecting') || feat(r, /interconnect/i), label: 'an interconnecting door' },
  { id: 'service', words: ['room service'], test: (r) => amen(r, 'room_service'), label: '24-hour room service' },
];
const INFO = [
  { id: 'beds', words: ['bed', 'beds', 'king', 'double bed', 'twin beds'], get: (r) => r.beds && `${r.name} has ${r.beds.toLowerCase()} beds.` },
  { id: 'size', words: ['size', 'how big', 'sq ft', 'square', 'spacious', 'big'], get: (r) => (r.size ? `${r.name} is about ${r.size}.` : null) },
  { id: 'cap', words: ['how many people', 'how many guests', 'capacity', 'sleeps', 'occupancy', 'fit', 'accommodate', 'how many persons'], get: (r) => (r.occupancy || r.guests ? `${r.name} sleeps ${r.occupancy || `up to ${r.guests} guests`}.` : null) },
  { id: 'view', words: ['view', 'what can i see', 'outside'], get: (r) => r.view && `${r.name}: ${r.view.toLowerCase()}.` },
];

// ---------- Recommendation ----------
export function recommend(rooms, { guests, q }) {
  const want = {
    sea: /\b(sea|ocean|sunrise|view|beach)\b/.test(q),
    family: /\b(family|kids?|children|parents)\b/.test(q) || (guests && (guests.children > 0 || guests.total >= 4)),
    work: /\b(work|business|laptop|office|meeting)\b/.test(q),
    special: /\b(honeymoon|anniversary|special|luxury|premium|suite|celebrat)\w*/.test(q),
    simple: /\b(budget|cheap|cheapest|affordable|economy|simple|basic|lowest)\b/.test(q),
  };
  const total = guests?.total || 0;
  const scored = rooms.map((r) => {
    const why = [];
    let s = 0;
    const cap = capacity(r);
    if (total) {
      if (cap >= total) {
        s += 3;
        why.push(`sleeps ${r.occupancy || `up to ${cap}`}`);
      } else s -= 6;
    }
    if ((want.sea || want.special) && (amen(r, 'sea_view') || /sea/i.test(r.view || ''))) {
      s += 3;
      why.push('faces the sea and the sunrise');
      if (amen(r, 'interconnecting') || /city/i.test(r.view || '')) s -= 1; // only partly sea-facing
    }
    if (want.family && amen(r, 'interconnecting')) {
      s += 4;
      why.push('has two interconnected rooms that keep a family together');
    } else if (want.family && cap >= 4) s += 1;
    if (want.work && amen(r, 'work_area')) {
      s += 2;
      why.push('has a work area');
    }
    if (want.special && /suite/i.test(r.name)) {
      s += 3;
      why.push('is our suite category');
    }
    if (want.simple && !amen(r, 'sea_view') && !/suite/i.test(r.name)) {
      s += 3;
      why.push('is our base room category');
    }
    return { r, s, why, fits: !total || cap >= total };
  });
  scored.sort((a, b) => b.s - a.s);
  const fits = scored.filter((x) => x.fits);
  const tooBig = total && !fits.length;
  return { picks: (fits.length ? fits : scored).slice(0, 2), tooBig, want };
}

// ---------- Booking help ----------
function waMessage(b, room) {
  const lines = [`Hello ${HOTEL.name}, I would like to enquire about a stay.`];
  if (b.check_in) lines.push(`Dates: ${fmtDay(b.check_in)}${b.check_out ? ` to ${fmtDay(b.check_out)} (${nightsBetween(b.check_in, b.check_out)} night${nightsBetween(b.check_in, b.check_out) === 1 ? '' : 's'})` : ''}`);
  if (b.adults) lines.push(`Guests: ${b.adults} adult${b.adults === 1 ? '' : 's'}${b.children ? `, ${b.children} child${b.children === 1 ? '' : 'ren'}` : ''}`);
  if (room) lines.push(`Room: ${room.name}`);
  lines.push('Please let me know availability and the rate.');
  return lines.join('\n');
}
function bookingActions(b, room) {
  const p = new URLSearchParams();
  if (b.check_in) p.set('check_in', b.check_in);
  if (b.check_out) p.set('check_out', b.check_out);
  if (b.adults) p.set('adults', String(b.adults));
  if (b.children) p.set('children', String(b.children));
  if (room) p.set('room_type', room.name);
  return [
    { kind: 'whatsapp', label: 'Send these details on WhatsApp', href: `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(waMessage(b, room))}` },
    { kind: 'link', label: 'Open the enquiry form, filled in', href: `/enquire${p.toString() ? `?${p}` : ''}` },
  ];
}

// ---------- Main ----------
const SMALL = [
  { re: /^(thanks|thank you|thank u|thx|ty|great|perfect|awesome|ok thanks|okay thanks|cool|nice)\b/, a: "You're welcome! Is there anything else I can help you with?" },
  { re: /^(bye|goodbye|see you|good night)\b/, a: `Goodbye, and we hope to welcome you to ${HOTEL.name} soon!` },
  { re: /\b(who are you|what are you|are you (a )?(bot|human|real|ai|robot))\b/, a: `I'm the ${HOTEL.name} virtual assistant. I answer from the hotel's own information, and our team is on WhatsApp for anything I can't confirm.` },
  { re: /^(how are you|how r u)\b/, a: "I'm doing well, thank you! How can I help with your stay in Kanyakumari?" },
];
const list = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const BOOK_RE = /\b(book|booking|reserve|reservation|available|availability|vacancy|free rooms?|enquire|enquiry|stay from|check in on|arriving|planning to (come|visit|stay))\b/;
const RECO_RE = /\b(which room|what room|best room|recommend|suggest|suitable|ideal|should (we|i) (book|choose|take)|right room|good for)\b/;
const COMPARE_RE = /\b(compare|comparison|difference|differ|versus|vs|better|or the)\b/;

function clauseIntents(text) {
  const parts = String(text)
    .split(/[?;]|\.\s|\band also\b|\balso\b|\band what about\b|\bwhat about\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  const ids = [];
  for (const p of parts.length ? parts : [text]) {
    const q = ` ${norm(p)} `;
    let best = null;
    let score = 0;
    for (const it of INTENTS) {
      const s = has(q, it.words) * (WEIGHT[it.id] || 1);
      if (s > score) {
        best = it;
        score = s;
      }
    }
    if (best && !ids.some((x) => x.it.id === best.id)) ids.push({ it: best, q, text: p });
  }
  return ids;
}

// Common shorthand and spelling slips ("hw much", "stndard", "avaliable").
const SHORT = { hw: 'how', u: 'you', r: 'are', ur: 'your', pls: 'please', plz: 'please', abt: 'about', wat: 'what', wht: 'what', rm: 'room', rms: 'rooms', nite: 'night', nites: 'nights', tmrw: 'tomorrow', tmr: 'tomorrow', tomo: 'tomorrow', 'wi fi': 'wifi', ppl: 'people', ac: 'ac' };
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export function correct(text, rooms = []) {
  const vocab = new Set(['how', 'much', 'what', 'where', 'when', 'which', 'available', 'availability', 'breakfast', 'restaurant', 'parking', 'balcony', 'bathroom', 'sunrise', 'sunset', 'tomorrow', 'weekend', 'december', 'january', 'february', 'november', 'october', 'september', 'children', 'adults', 'people', 'family', 'suggest', 'recommend', 'compare', 'difference', 'television', 'conditioned', 'interconnected', 'directions', 'station', 'airport', 'please', 'night', 'nights', 'price', 'booking']);
  Object.keys(NUM).forEach((w) => vocab.add(w));
  ['with', 'have', 'kids', 'want', 'need', 'stay', 'from', 'this', 'that', 'next', 'week', 'days', 'adult', 'child', 'guests', 'couple', 'there', 'their', 'about', 'would', 'could', 'should', 'like', 'love', 'some', 'many', 'more', 'less', 'your', 'hotel', 'room', 'time', 'date', 'dates', 'good', 'best', 'tell', 'show', 'give', 'know', 'does', 'free', 'open', 'near', 'cost', 'view', 'sea', 'beach', 'temple', 'food', 'veg', 'bar'].forEach((w) => vocab.add(w));
  for (const it of INTENTS) for (const w of it.words) w.split(' ').forEach((x) => x.length > 3 && vocab.add(x));
  for (const a of ATTRS) for (const w of a.words) w.split(' ').forEach((x) => x.length > 3 && vocab.add(x));
  rooms.forEach((r) => nameWords(r).forEach((x) => x.length > 3 && vocab.add(x)));
  const words = [...vocab];
  return String(text).replace(/[A-Za-z]+/g, (w) => {
    const lw = w.toLowerCase();
    if (SHORT[lw]) return SHORT[lw];
    if (lw.length < 5 || vocab.has(lw) || vocab.has(lw.replace(/s$/, ''))) return w;
    let best = null;
    let bd = lw.length >= 8 ? 2 : 1;
    for (const v of words) {
      const dd = lev(lw, v);
      if (dd <= bd && (dd < bd || !best)) {
        best = v;
        bd = dd;
      }
    }
    return best || w;
  });
}

export function think(message, rooms = [], prev = {}, { now = new Date(), blocked = [] } = {}) {
  const raw = correct(String(message || '').slice(0, 600), rooms);
  const q = ` ${norm(raw)} `;
  const state = { room: prev.room || null, flow: prev.flow || null, last: null, booking: { ...(prev.booking || {}) } };
  const parts = [];
  const actions = [];
  let cards = [];
  let whatsapp = false;
  const facts = [];
  const handled = new Set();
  let suggestions = [];
  const roomById = (id) => rooms.find((r) => r.id === id);

  if (OFF_TOPIC.test(q)) return { answer: `I can only help with questions about ${HOTEL.name}: rooms, facilities, dining, directions and enquiries. What would you like to know?`, state, actions, rooms: [], suggestions: ['What room types do you have?', 'How do I get to the hotel?'], whatsapp: false, facts: '' };

  const small = SMALL.find((s) => s.re.test(q.trim()));
  if (small && q.trim().split(' ').length <= 6) return { answer: small.a, state, actions, rooms: [], suggestions: ['Which room is best for us?', 'What facilities do you have?', 'Sunrise time tomorrow'], whatsapp: false, facts: '' };

  // Details in this message, remembered for the rest of the conversation.
  const dates = parseDates(raw, now);
  const guests = parseGuests(raw);
  let named = roomsMentioned(raw, rooms);
  const refersBack = /\b(it|this room|that room|this one|that one|the room|same room|there)\b/.test(q);
  if (!named.length && refersBack && state.room && roomById(state.room)) named = [roomById(state.room)];
  if (named.length === 1) state.room = named[0].id;
  if (dates.from) {
    state.booking.check_in = dates.from;
    state.booking.check_out = dates.to || (state.booking.check_out > dates.from ? state.booking.check_out : null);
  } else if (dates.nights && state.booking.check_in) state.booking.check_out = addDays(state.booking.check_in, dates.nights);
  if (guests) {
    if (guests.adults) state.booking.adults = guests.adults;
    state.booking.children = guests.children || 0;
  }
  if (named.length === 1 && (state.flow === 'booking' || BOOK_RE.test(q))) state.booking.room = named[0].id;
  const b = state.booking;
  const today = todayIST(now);
  facts.push(`Today in Kanyakumari: ${fmtDay(today)} ${today.slice(0, 4)}.`);

  // 1. Sunrise and sunset.
  const sunFollowUp = prev.last === 'sun' && dates.from && !BOOK_RE.test(q) && !guests;
  if (sunFollowUp || (/\b(sunrise|sunset|sun rise|sun set)\b/.test(q) && /\b(time|when|what time|tomorrow|today|on|at)\b/.test(q))) {
    const day = dates.from || (/\btomorrow\b/.test(q) ? addDays(today, 1) : today);
    const d = toDate(day);
    const s = sunOn(GEO, new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    parts.push(`On ${fmtDay(day)}, sunrise in Kanyakumari is at about ${s.sunrise} and sunset at about ${s.sunset}. Our sea-facing rooms look straight at the sunrise. More times on [Plan your visit](/plan-your-visit).`);
    facts.push(`Sunrise/sunset on ${fmtDay(day)}: ${s.sunrise} / ${s.sunset} (calculated).`);
    handled.add('sights').add('seaview').add('sun');
    state.last = 'sun';
    suggestions = ['Sunset time on Sunday', 'Which rooms face the sea?', 'Book for this weekend'];
  } else state.last = null;
  if (/\b(weather|rain|temperature|monsoon|climate|hot|cold)\b/.test(q)) {
    parts.push('You can see the live weather and the forecast for Kanyakumari on [Plan your visit](/plan-your-visit).');
    handled.add('weather');
  }

  // 2. Compare rooms.
  if (named.length >= 2 && COMPARE_RE.test(q)) {
    const lines = named.slice(0, 3).map((r) => {
      const a = (r.amenities || []).map(amenityLabel).filter(Boolean);
      return `- [${r.name}](/rooms/${r.id}): ${[r.view, r.beds && `${r.beds.toLowerCase()} beds`, r.occupancy && `sleeps ${r.occupancy}`, r.size].filter(Boolean).join(', ')}. ${r.summary || ''}${a.length ? ` Has: ${a.slice(0, 7).join(', ').toLowerCase()}.` : ''}`;
    });
    const [x, y] = named;
    const onlyX = (x.amenities || []).filter((id) => !(y.amenities || []).includes(id)).map(amenityLabel).filter(Boolean);
    const onlyY = (y.amenities || []).filter((id) => !(x.amenities || []).includes(id)).map(amenityLabel).filter(Boolean);
    const diff = [onlyX.length && `${x.name} adds ${onlyX.join(', ').toLowerCase()}`, onlyY.length && `${y.name} adds ${onlyY.join(', ').toLowerCase()}`].filter(Boolean).join('; ');
    parts.push(`Here's how they compare:\n${lines.join('\n')}\n${diff ? `In short: ${diff}.` : 'They have the same listed amenities, so the choice comes down to the room style and outlook described above.'} Rates for both are given on enquiry.`);
    cards = named.slice(0, 3);
    handled.add('rooms').add('seaview');
  }

  // 3. "Does it have…?" and other questions about one room.
  const room = named.length === 1 ? named[0] : null;
  if (room && !handled.has('rooms')) {
    const asked = ATTRS.filter((a) => has(q, a.words));
    const info = INFO.filter((i) => has(q, i.words));
    if (asked.length) {
      for (const a of asked.slice(0, 3)) {
        if (a.test(room)) parts.push(`Yes, the ${room.name} has ${a.label}.`);
        else {
          const others = rooms.filter((r) => r.id !== room.id && a.test(r));
          parts.push(`${a.label[0].toUpperCase()}${a.label.slice(1)} isn't listed for the ${room.name}.${others.length ? ` The ${list(others.map((r) => `[${r.name}](/rooms/${r.id})`))} ${others.length === 1 ? 'has' : 'have'} ${a.label}.` : ' Please check with our team.'}`);
          if (!others.length) whatsapp = true;
        }
      }
      handled.add('rooms').add('facilities').add('seaview');
      cards = [room];
    }
    for (const i of info) {
      const v = i.get(room);
      parts.push(v || `I don't have that detail for the ${room.name}; our team can tell you.`);
      if (!v) whatsapp = true;
      handled.add('rooms');
      cards = [room];
    }
  }

  // 3b. "Which rooms have a balcony?" (a feature, no particular room).
  if (!room && !handled.has('rooms')) {
    const asked = ATTRS.filter((x) => has(q, x.words) && !['sea', 'sunrise', 'service', 'wifi'].includes(x.id));
    for (const x of asked.slice(0, 2)) {
      const withIt = rooms.filter((r) => x.test(r));
      parts.push(withIt.length ? (withIt.length === rooms.length ? `Every room type has ${x.label}.` : withIt.length === 1 ? `Only the [${withIt[0].name}](/rooms/${withIt[0].id}) has ${x.label}.` : `${list(withIt.map((r) => `The [${r.name}](/rooms/${r.id})`))} have ${x.label}.`) : `${x.label[0].toUpperCase()}${x.label.slice(1)} isn't listed for any room type. Please check with our team. [[WHATSAPP]]`);
      if (withIt.length && withIt.length < rooms.length) cards = withIt;
      handled.add('rooms').add('facilities');
    }
  }

  // 4. Recommendation.
  const wantsReco = RECO_RE.test(q) || (guests && !room && !BOOK_RE.test(q) && state.flow !== 'booking');
  if (wantsReco && rooms.length) {
    const g = guests || (b.adults ? { adults: b.adults, children: b.children || 0, total: b.adults + (b.children || 0) } : null);
    const { picks, tooBig } = recommend(rooms, { guests: g, q });
    const who = g ? `${g.adults ? `${g.adults} adult${g.adults === 1 ? '' : 's'}` : ''}${g.children ? ` and ${g.children} child${g.children === 1 ? '' : 'ren'}` : ''}` : '';
    const top = picks[0];
    const linked = rooms.find((r) => amen(r, 'interconnecting'));
    if (tooBig)
      parts.push(`For a group of ${g.total} you'll need more than one room: each room type sleeps up to ${Math.max(...rooms.map(capacity))}.${linked ? ` The [${linked.name}](/rooms/${linked.id}) keeps a family together, and` : ''} our team can arrange several rooms for you. [[WHATSAPP]]`);
    else
      parts.push(
        `${who ? `For ${who.trim()}, ` : ''}I'd suggest the [${top.r.name}](/rooms/${top.r.id})${top.why.length ? `: it ${list(top.why.map((w) => w.replace(/^sleeps/, 'sleeps')))}` : ''}.${picks[1] ? ` Another good option is the [${picks[1].r.name}](/rooms/${picks[1].r.id})${picks[1].why.length ? `, which ${list(picks[1].why)}` : ''}.` : ''}${g?.children ? ' Room capacities count children under 6; tell us the children’s ages and we will advise.' : ''} Rates are given on enquiry for your dates.`
      );
    cards = picks.map((p) => p.r);
    state.room = top.r.id;
    facts.push(`Suggested rooms: ${picks.map((p) => `${p.r.name} (${p.why.join(', ') || 'general fit'})`).join('; ')}.`);
    handled.add('rooms').add('seaview').add('children');
    suggestions = [`Tell me more about the ${top.r.name}`, 'Book this room', picks[1] ? `Compare ${top.r.name} and ${picks[1].r.name}` : 'Show me room photos'];
  }

  // 5. Putting an enquiry together.
  const bookingNow = !handled.has('sun') && (BOOK_RE.test(q) || (state.flow === 'booking' && (dates.mentioned || dates.nights || guests)) || (dates.from && !handled.has('weather')));
  if (bookingNow) {
    state.flow = 'booking';
    const r = b.room ? roomById(b.room) : room;
    const have = [];
    if (b.check_in) have.push(`${fmtDay(b.check_in)}${b.check_out ? ` to ${fmtDay(b.check_out)} (${nightsBetween(b.check_in, b.check_out)} night${nightsBetween(b.check_in, b.check_out) === 1 ? '' : 's'})` : ''}`);
    if (b.adults) have.push(`${b.adults} adult${b.adults === 1 ? '' : 's'}${b.children ? ` and ${b.children} child${b.children === 1 ? '' : 'ren'}` : ''}`);
    if (r) have.push(r.name);
    let line = have.length ? `Noted: ${have.join(', ')}.` : "I'd be happy to help you enquire.";
    if (b.check_in && b.check_in < today) line += ' That date is in the past; please choose another.';
    if (b.check_in && b.check_out && blocked.length) {
      const n = nightsBetween(b.check_in, b.check_out);
      const full = Array.from({ length: Math.min(n, 60) }, (_, i) => addDays(b.check_in, i)).filter((d) => blocked.includes(d));
      if (full.length) {
        line += ` The hotel has marked ${full.map(fmtDay).join(', ')} as fully booked, so please try other dates or ask our team about alternatives.`;
        facts.push(`Fully booked nights in the requested stay: ${full.join(', ')}.`);
      } else {
        line += ' None of those nights is marked fully booked, so it looks promising. Our team confirms availability and the rate.';
        facts.push('No requested night is marked fully booked by the hotel (availability still to be confirmed by staff).');
      }
    } else if (b.check_in) line += ' Our team confirms availability and the rate.';
    const missing = !b.check_in ? 'dates' : !b.check_out ? 'checkout' : !b.adults ? 'guests' : null;
    if (missing === 'dates') {
      line += ' Which dates are you thinking of? For example "5 to 7 December" or "this weekend".';
      suggestions = ['This weekend', 'Tomorrow for 2 nights', 'Next Friday for 3 nights'];
    } else if (missing === 'checkout') {
      line += ` How many nights will you stay from ${fmtDay(b.check_in)}?`;
      suggestions = ['1 night', '2 nights', '3 nights'];
    } else if (missing === 'guests') {
      line += ' How many guests: adults and children?';
      suggestions = ['2 adults', '2 adults and 1 child', 'Family of 4'];
    } else {
      line += r ? ' Everything is ready: send it to our team below.' : ' Would you like a room suggestion, or send it to our team now?';
      suggestions = r ? ['Does it have a sea view?', 'How do I get to the hotel?'] : ['Which room is best for us?', 'Show me room photos'];
    }
    parts.push(line);
    actions.push(...bookingActions(b, r));
    handled.add('avail').add('price').add('rooms').add('children');
    if (b.adults && b.check_in && b.check_out) facts.push(`Enquiry details so far: ${waMessage(b, r).replace(/\n/g, ' | ')}`);
  }

  // 6. Anything else asked in the same message (several questions at once).
  const extra = clauseIntents(raw).filter((x) => !handled.has(x.it.id) && !(x.it.id === 'rooms' && (room || parts.length)));
  for (const x of extra.slice(0, parts.length ? 2 : 3)) {
    const a = x.it.answer({ q: x.q, rooms });
    parts.push(a);
    if (x.it.showRooms && !cards.length) cards = rooms;
    handled.add(x.it.id);
  }
  if (room && !parts.length) {
    const r = localAnswer(raw, rooms);
    parts.push(r.answer);
    cards = r.rooms || [room];
    suggestions = ['Does it have a balcony?', 'How many people can stay?', 'Book this room'];
  }
  if (!parts.length) {
    const r = localAnswer(raw, rooms);
    parts.push(r.answer);
    cards = r.rooms || [];
  }
  if (PRICE_WORDS.some((w) => q.includes(` ${w} `)) && !parts.some((p) => /rate|price/i.test(p))) parts.push('Rates depend on your dates and are confirmed by our team. [[WHATSAPP]]');

  if (handled.has('sun')) state.booking = { ...(prev.booking || {}) }; // a sunrise date is not a stay date
  let answer = parts.join('\n\n');
  if (answer.includes('[[WHATSAPP]]')) whatsapp = true;
  answer = answer.replace(/\s*\[\[WHATSAPP\]\]\s*/g, ' ').trim();
  if (actions.some((a) => a.kind === 'whatsapp')) whatsapp = false; // the pre-filled WhatsApp button is already there
  if (!suggestions.length) suggestions = room ? ['Does it have a sea view?', 'Book this room', 'Show me room photos'] : ['Which room is best for a family?', 'Is there parking?', 'Sunrise time tomorrow'];
  return { answer, whatsapp, actions, rooms: cards, suggestions, state, facts: facts.join('\n') };
}
