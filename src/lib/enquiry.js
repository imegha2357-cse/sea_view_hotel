import { firebaseReady, loadFirebase, NOT_CONFIGURED } from './firebase';
import { HOTEL, ROOMS, ROOM_TYPES, OFFERS } from '../data/content';
import { getSource } from './attribution';
import { reportError } from './errors';

const SENT = 'seaview-sent';
const sentTimes = () => {
  try {
    return JSON.parse(localStorage.getItem(SENT) || '[]');
  } catch {
    return [];
  }
};

export const MESSAGE_MAX = 1000;

export const ENQUIRY_TYPES = [
  { id: 'stay', label: 'Room stay' },
  { id: 'event', label: 'Wedding or family event' },
  { id: 'meeting', label: 'Meeting or conference' },
];
export const PICKUPS = [
  { id: 'none', label: 'No pick-up needed' },
  { id: 'station', label: 'Kanyakumari railway station' },
  { id: 'bus', label: 'Kanyakumari bus terminus' },
  { id: 'airport', label: 'Thiruvananthapuram airport' },
];
export const ADDONS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'extra_bed', label: 'Extra bed' },
  { id: 'sightseeing', label: 'Sightseeing tour' },
  { id: 'decoration', label: 'Room decoration (birthday, honeymoon)' },
  { id: 'late_checkout', label: 'Late check-out' },
];
export const CALLBACK_TIMES = ['Any time', 'Morning (9 am – 12 pm)', 'Afternoon (12 – 4 pm)', 'Evening (4 – 8 pm)', 'WhatsApp only, no call'];

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const emptyEnquiry = (profile) => ({
  enquiry_type: 'stay',
  guest_name: profile?.name || '',
  phone: profile?.phone || '',
  email: profile?.email || '',
  check_in: '',
  check_out: '',
  adults: 2,
  children: 0,
  event_guests: '',
  room_type: '',
  pickup: 'none',
  addons: [],
  callback_time: CALLBACK_TIMES[0],
  promo_code: '',
  message: '',
  privacy: false,
  newsletter: false,
  company: '', // honeypot: real people never fill this
});

const PHONE = /^\+?[0-9][0-9\s-]{8,16}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// PRD 6.2 validation. Firestore rules repeat these checks on the server.
export function validateEnquiry(v, { blockedNights = [] } = {}) {
  const e = {};
  const name = v.guest_name.trim();
  if (!name) e.guest_name = 'Enter your name.';
  else if (name.length > 80) e.guest_name = 'Keep the name under 80 characters.';

  const phoneDigits = v.phone.replace(/\D/g, '');
  if (!v.phone.trim()) e.phone = 'Enter a phone or WhatsApp number.';
  else if (!PHONE.test(v.phone.trim()) || phoneDigits.length < 10 || phoneDigits.length > 13)
    e.phone = 'Enter a 10-digit number, with country code if outside India.';

  if (v.email.trim() && !EMAIL.test(v.email.trim())) e.email = 'Enter a valid email, or leave it blank.';
  if (v.newsletter && !v.email.trim()) e.email = 'Add an email to receive offers, or untick the offers box.';

  const isStay = v.enquiry_type === 'stay';
  if (!v.check_in) e.check_in = isStay ? 'Choose a check-in date.' : 'Choose the event date.';
  else if (v.check_in < todayISO()) e.check_in = 'That date is in the past.';
  if (!v.check_out) e.check_out = isStay ? 'Choose a check-out date.' : 'Choose the end date.';
  else if (v.check_in && v.check_out <= v.check_in) e.check_out = isStay ? 'Check-out must be after check-in.' : 'The end date must be after the start date.';
  if (!e.check_in && !e.check_out && blockedNights.length)
    e.check_out = `We are fully booked on ${blockedNights.length === 1 ? formatISO(blockedNights[0]) : `${blockedNights.length} of these nights`}. Try other dates or WhatsApp us.`;

  if (!Number.isInteger(+v.adults) || +v.adults < 1) e.adults = 'At least 1 adult.';
  if (!Number.isInteger(+v.children) || +v.children < 0) e.children = 'Enter 0 or more.';
  if (!isStay && v.event_guests !== '' && (!Number.isInteger(+v.event_guests) || +v.event_guests < 1 || +v.event_guests > 1000))
    e.event_guests = 'Enter a number of guests between 1 and 1000.';
  if (v.room_type && !ROOM_TYPES.includes(v.room_type)) e.room_type = 'Choose a room from the list.';
  if (v.promo_code && v.promo_code.length > 30) e.promo_code = 'That code is too long.';
  if (v.message.length > MESSAGE_MAX) e.message = `Keep the message under ${MESSAGE_MAX} characters.`;
  if (!v.privacy) e.privacy = 'Please confirm you have read the privacy notice.';
  return e;
}

export const formatISO = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '[date]';

export async function submitEnquiry(v, user) {
  if (!firebaseReady) throw new Error(NOT_CONFIGURED);
  if (v.company) {
    // Feature #90: the hidden field was filled, so this is a bot. Drop it, and log it for staff (Inbox → Website errors).
    reportError('Blocked spam enquiry (hidden anti-spam field was filled)');
    return { id: 'ignored' };
  }
  // Feature #82: one enquiry a minute and at most five a day from the same browser.
  const recent = sentTimes().filter((t) => Date.now() - t < 86400000);
  if (recent.length && Date.now() - recent[recent.length - 1] < 60000) throw new Error('You sent an enquiry a moment ago. Please wait a minute before sending another, or WhatsApp us.');
  if (recent.length >= 5) throw new Error('You have sent several enquiries today. Our team will reply to them; for anything urgent, please call or WhatsApp us.');
  const { db, F } = await loadFirebase();
  const toDate = (iso) => F.Timestamp.fromDate(new Date(`${iso}T12:00:00`));
  const src = getSource();
  const isStay = v.enquiry_type === 'stay';
  const data = {
    enquiry_type: v.enquiry_type,
    guest_name: v.guest_name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim() || null,
    check_in: toDate(v.check_in),
    check_out: toDate(v.check_out),
    adults: +v.adults,
    children: +v.children,
    event_guests: !isStay && v.event_guests !== '' ? +v.event_guests : null,
    room_type: isStay ? v.room_type || null : null,
    pickup: v.pickup || 'none',
    addons: isStay ? v.addons.slice(0, 5) : [],
    callback_time: (v.callback_time || '').slice(0, 40) || null,
    promo_code: v.promo_code.trim().toUpperCase() || null,
    message: v.message.trim() || null,
    referrer: src.referrer || null,
    utm_source: src.utm_source || null,
    utm_medium: src.utm_medium || null,
    utm_campaign: src.utm_campaign || null,
    lang: (navigator.language || 'en').slice(0, 8),
    source: 'website_form',
    status: 'New',
    userId: user?.uid || null,
    privacy_consent_at: F.serverTimestamp(), // feature #86: consent record
    created_at: F.serverTimestamp(),
    updated_at: F.serverTimestamp(),
  };
  // Resolves only after Firestore confirms the write, so success is never shown early (PRD 6.1 step 4).
  const ref = await F.addDoc(F.collection(db, 'booking_enquiries'), data);
  try {
    localStorage.setItem(SENT, JSON.stringify([...recent, Date.now()].slice(-5)));
  } catch {}

  // Feature #20: offers newsletter, only with an explicit tick.
  if (v.newsletter && v.email.trim()) {
    F.addDoc(F.collection(db, 'newsletter'), { email: v.email.trim(), consent: true, created_at: F.serverTimestamp(), lang: data.lang }).catch(() => {});
  }
  // Features #11/#13: email alert to staff and an auto-reply to the guest (no-op until email is configured).
  fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: ref.id }), keepalive: true }).catch(() => {});
  return { id: ref.id };
}

// Features #2/#3: a stay estimate, shown only once the hotel adds "from" rates in content.js.
export function estimate(v) {
  const room = ROOMS.find((r) => r.name === v.room_type);
  if (!room?.rate || !v.check_in || !v.check_out) return null;
  const n = nights(v.check_in, v.check_out);
  if (!n) return null;
  return { nights: n, perNight: room.rate, total: room.rate * n };
}

export const offerFor = (code) => OFFERS.find((o) => o.code && o.code.toUpperCase() === String(code || '').trim().toUpperCase());

// PRD 6.3 WhatsApp message, URL-encoded. Feature #19 adds room and dates when known.
export function whatsappUrl(v = {}) {
  const lines = [
    `Hello ${HOTEL.name}, I would like to enquire about a ${v.enquiry_type && v.enquiry_type !== 'stay' ? 'booking for an event' : 'stay'}.`,
    `Name: ${v.guest_name?.trim() || '[your name]'}`,
    `Check-in: ${formatISO(v.check_in)}`,
    `Check-out: ${formatISO(v.check_out)}`,
    `Guests: ${v.adults ?? 2} adults / ${v.children ?? 0} children`,
    `Room preference: ${v.room_type || 'Any'}`,
    'Please share availability and rates.',
  ];
  return `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const nights = (a, b) => {
  if (!a || !b) return 0;
  const da = a.toDate ? a.toDate() : new Date(`${a}T12:00:00`);
  const dbb = b.toDate ? b.toDate() : new Date(`${b}T12:00:00`);
  return Math.max(0, Math.round((dbb - da) / 86400000));
};

export const nightsLabel = (a, b) => {
  const n = nights(a, b);
  return `${n} ${n === 1 ? 'night' : 'nights'}`;
};

export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Feature #10: keep an unsent enquiry in this browser and offer to restore it.
const DRAFT = 'seaview-enquiry-draft';
export const draft = {
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      return d && Date.now() - d.at < 14 * 86400000 ? d.v : null;
    } catch {
      return null;
    }
  },
  save(v) {
    try {
      const { privacy, company, ...rest } = v;
      if (rest.guest_name || rest.phone || rest.check_in || rest.message) localStorage.setItem(DRAFT, JSON.stringify({ at: Date.now(), v: rest }));
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(DRAFT);
    } catch {}
  },
};
