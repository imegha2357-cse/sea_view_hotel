import { firebaseReady, loadFirebase, NOT_CONFIGURED } from './firebase';
import { HOTEL } from '../data/content';
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

// The hotel's official WhatsApp number (international format, digits only). Change it here, or set
// NEXT_PUBLIC_WHATSAPP_NUMBER in Vercel, and every WhatsApp button and the enquiry form follow.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || HOTEL.whatsapp).replace(/\D/g, '');
export const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

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
  { id: 'early_checkin', label: 'Early check-in' },
];
// Feature #13: what kind of room within the type the guest would like (the team does its best).
export const ROOM_PREFS = ['No particular request', 'High floor', 'Low floor or near the lift', 'Facing the Vivekananda Rock', 'Quiet room', 'Rooms next to each other'];
// Feature #57: a guest's referral code (from a friend's link) travels with the enquiry.
export const getRefCode = () => {
  try {
    return (localStorage.getItem('sv-ref') || '').slice(0, 20);
  } catch {
    return '';
  }
};
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
  preference: ROOM_PREFS[0],
  rooms: 1,
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
export function validateEnquiry(v, { blockedNights = [], rooms = null } = {}) {
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
  // Dates are optional (a guest may not have fixed them yet), but if one is given both must make sense.
  if (v.check_in || v.check_out) {
    if (!v.check_in) e.check_in = isStay ? 'Add the check-in date too, or clear both dates.' : 'Add the start date too, or clear both dates.';
    else if (v.check_in < todayISO()) e.check_in = 'That date is in the past.';
    if (!v.check_out) e.check_out = isStay ? 'Add the check-out date too, or clear both dates.' : 'Add the end date too, or clear both dates.';
    else if (v.check_in && v.check_out <= v.check_in) e.check_out = isStay ? 'Check-out must be after check-in.' : 'The end date must be after the start date.';
    if (!e.check_in && !e.check_out && blockedNights.length)
      e.check_out = `We are fully booked on ${blockedNights.length === 1 ? formatISO(blockedNights[0]) : `${blockedNights.length} of these nights`}. Try other dates or WhatsApp us.`;
  }

  if (!Number.isInteger(+v.adults) || +v.adults < 1) e.adults = 'At least 1 adult.';
  if (!Number.isInteger(+v.children) || +v.children < 0) e.children = 'Enter 0 or more.';
  if (!isStay && v.event_guests !== '' && (!Number.isInteger(+v.event_guests) || +v.event_guests < 1 || +v.event_guests > 1000))
    e.event_guests = 'Enter a number of guests between 1 and 1000.';
  if (v.room_type && (v.room_type.length > 60 || (rooms && !rooms.some((r) => r.name === v.room_type)))) e.room_type = 'Choose a room from the list.';
  if (v.promo_code && v.promo_code.length > 30) e.promo_code = 'That code is too long.';
  if (v.message.length > MESSAGE_MAX) e.message = `Keep the message under ${MESSAGE_MAX} characters.`;
  if (!v.privacy) e.privacy = 'Please confirm you have read the privacy notice.';
  return e;
}

export const formatISO = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'not decided';

export async function submitEnquiry(v, user) {
  if (!firebaseReady) throw new Error(NOT_CONFIGURED);
  if (v.company) {
    // Feature #90: the hidden field was filled, so this is a bot. Drop it, and log it for staff (Inbox → Website errors).
    reportError('Blocked spam enquiry (hidden anti-spam field was filled)');
    return { id: 'ignored' };
  }
  // Feature #82: one enquiry a minute and at most five a day from the same browser.
  const recent = sentTimes().filter((t) => Date.now() - t < 86400000);
  // The guest still gets WhatsApp; only the copy for the staff dashboard is skipped.
  if (recent.length && Date.now() - recent[recent.length - 1] < 60000) return { id: 'throttled' };
  if (recent.length >= 5) return { id: 'throttled' };
  const { db, F } = await loadFirebase();
  const toDate = (iso) => (iso ? F.Timestamp.fromDate(new Date(`${iso}T12:00:00`)) : null);
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
    addons: isStay ? v.addons.slice(0, 6) : [],
    preference: isStay && v.preference && v.preference !== ROOM_PREFS[0] ? v.preference.slice(0, 80) : null,
    rooms: isStay ? Math.min(60, Math.max(1, +v.rooms || 1)) : null,
    ref_code: getRefCode() || null,
    callback_time: (v.callback_time || '').slice(0, 40) || null,
    promo_code: v.promo_code.trim().toUpperCase() || null,
    message: v.message.trim() || null,
    referrer: src.referrer || null,
    utm_source: src.utm_source || null,
    utm_medium: src.utm_medium || null,
    utm_campaign: src.utm_campaign || null,
    lang: (navigator.language || 'en').slice(0, 8),
    source: 'website_form',
    channel: 'whatsapp',
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

// Features #2/#3: a stay estimate, shown only when the admin has set a rate for the room.
export function estimate(v, rooms = []) {
  const room = rooms.find((r) => r.name === v.room_type);
  if (!room?.rate || !v.check_in || !v.check_out) return null;
  const n = nights(v.check_in, v.check_out);
  if (!n) return null;
  return { nights: n, perNight: room.rate, total: room.rate * n };
}

export const offerFor = (code, offers = []) => offers.find((o) => o.code && o.code.toUpperCase() === String(code || '').trim().toUpperCase());

const TYPE_TEXT = { stay: 'a room stay', event: 'a wedding or family event', meeting: 'a meeting or conference' };

// The full WhatsApp message built from the enquiry form (requirement: clear, readable, every detail).
export function enquiryMessage(v, { offer, pickups = PICKUPS, addons = ADDONS } = {}) {
  const isStay = (v.enquiry_type || 'stay') === 'stay';
  const kids = +v.children || 0;
  const lines = [`Hello ${HOTEL.name}, I would like to enquire about ${TYPE_TEXT[v.enquiry_type] || TYPE_TEXT.stay}.`, ''];
  lines.push(`Name: ${v.guest_name.trim()}`);
  lines.push(`Phone: ${v.phone.trim()}`);
  if (v.email?.trim()) lines.push(`Email: ${v.email.trim()}`);
  if (isStay) {
    lines.push(`Room: ${v.room_type || 'No preference'}${+v.rooms > 1 ? ` × ${+v.rooms} rooms` : ''}`);
    if (v.preference && v.preference !== ROOM_PREFS[0]) lines.push(`Request: ${v.preference}`);
    lines.push(`Guests: ${+v.adults || 1} ${+v.adults === 1 ? 'adult' : 'adults'}${kids ? `, ${kids} ${kids === 1 ? 'child' : 'children'} under 6` : ''}`);
  } else {
    lines.push(`Number of guests: ${v.event_guests || 'not decided yet'}`);
  }
  if (v.check_in && v.check_out) lines.push(`Dates: ${formatISO(v.check_in)} to ${formatISO(v.check_out)}${isStay ? ` (${nightsLabel(v.check_in, v.check_out)})` : ''}`);
  else lines.push('Dates: not decided yet');
  const pickup = pickups.find((p) => p.id === v.pickup && p.id !== 'none');
  if (pickup) lines.push(`Pick-up: ${pickup.label}`);
  const extras = (v.addons || []).map((a) => addons.find((x) => x.id === a)?.label).filter(Boolean);
  if (extras.length) lines.push(`Extras: ${extras.join(', ')}`);
  if (v.callback_time && v.callback_time !== CALLBACK_TIMES[0]) lines.push(`Best time to call: ${v.callback_time}`);
  if (v.promo_code?.trim()) lines.push(`Offer: ${offer ? `${offer.title} (${offer.code})` : v.promo_code.trim().toUpperCase()}`);
  const ref = getRefCode();
  if (ref) lines.push(`Referred by: ${ref}`);
  if (v.message?.trim()) lines.push('', `Message: ${v.message.trim()}`);
  lines.push('', 'Please let me know availability and the rate. Thank you.');
  return lines.join('\n');
}

// Short WhatsApp message for the quick "WhatsApp us" buttons around the site.
export function whatsappUrl(v = {}) {
  const lines = [`Hello ${HOTEL.name}, I would like to enquire about ${TYPE_TEXT[v.enquiry_type] || TYPE_TEXT.stay}.`];
  if (v.guest_name?.trim()) lines.push(`Name: ${v.guest_name.trim()}`);
  if (v.room_type) lines.push(`Room: ${v.room_type}`);
  if (v.check_in && v.check_out) lines.push(`Dates: ${formatISO(v.check_in)} to ${formatISO(v.check_out)}`);
  lines.push('Please share availability and rates.');
  return waLink(lines.join('\n'));
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

// "12 Dec 2026 to 14 Dec 2026", or a clear note when the guest did not give dates.
export const stayDates = (a, b) => (a && b ? `${formatDate(a)} to ${formatDate(b)}` : 'Dates not given');
