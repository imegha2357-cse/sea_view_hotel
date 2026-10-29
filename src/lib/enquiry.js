import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, firebaseReady, NOT_CONFIGURED } from './firebase';
import { HOTEL, ROOM_TYPES } from '../data/content';

export const MESSAGE_MAX = 1000;

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const emptyEnquiry = (profile) => ({
  guest_name: profile?.name || '',
  phone: profile?.phone || '',
  email: profile?.email || '',
  check_in: '',
  check_out: '',
  adults: 2,
  children: 0,
  room_type: '',
  message: '',
  privacy: false,
  company: '', // honeypot: real people never fill this
});

const PHONE = /^\+?[0-9][0-9\s-]{8,16}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// PRD 6.2 validation. Firestore rules repeat these checks on the server.
export function validateEnquiry(v) {
  const e = {};
  const name = v.guest_name.trim();
  if (!name) e.guest_name = 'Enter your name.';
  else if (name.length > 80) e.guest_name = 'Keep the name under 80 characters.';

  const phoneDigits = v.phone.replace(/\D/g, '');
  if (!v.phone.trim()) e.phone = 'Enter a phone or WhatsApp number.';
  else if (!PHONE.test(v.phone.trim()) || phoneDigits.length < 10 || phoneDigits.length > 13)
    e.phone = 'Enter a 10-digit number, with country code if outside India.';

  if (v.email.trim() && !EMAIL.test(v.email.trim())) e.email = 'Enter a valid email, or leave it blank.';

  if (!v.check_in) e.check_in = 'Choose a check-in date.';
  else if (v.check_in < todayISO()) e.check_in = 'Check-in cannot be in the past.';
  if (!v.check_out) e.check_out = 'Choose a check-out date.';
  else if (v.check_in && v.check_out <= v.check_in) e.check_out = 'Check-out must be after check-in.';

  if (!Number.isInteger(+v.adults) || +v.adults < 1) e.adults = 'At least 1 adult.';
  if (!Number.isInteger(+v.children) || +v.children < 0) e.children = 'Enter 0 or more.';
  if (v.room_type && !ROOM_TYPES.includes(v.room_type)) e.room_type = 'Choose a room from the list.';
  if (v.message.length > MESSAGE_MAX) e.message = `Keep the message under ${MESSAGE_MAX} characters.`;
  if (!v.privacy) e.privacy = 'Please confirm you have read the privacy notice.';
  return e;
}

const toDate = (iso) => Timestamp.fromDate(new Date(`${iso}T12:00:00`));

export async function submitEnquiry(v, user) {
  if (!firebaseReady) throw new Error(NOT_CONFIGURED);
  if (v.company) return { id: 'ignored' }; // silently drop bots
  const data = {
    guest_name: v.guest_name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim() || null,
    check_in: toDate(v.check_in),
    check_out: toDate(v.check_out),
    adults: +v.adults,
    children: +v.children,
    room_type: v.room_type || null,
    message: v.message.trim() || null,
    source: 'website_form',
    status: 'New',
    userId: user?.uid || null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  // Resolves only after Firestore confirms the write, so success is never shown early (PRD 6.1 step 4).
  const ref = await addDoc(collection(db, 'booking_enquiries'), data);
  return { id: ref.id };
}

const fmt = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '[date]';

// PRD 6.3 WhatsApp message, URL-encoded.
export function whatsappUrl(v = {}) {
  const lines = [
    `Hello ${HOTEL.name}, I would like to enquire about a stay.`,
    `Name: ${v.guest_name?.trim() || '[your name]'}`,
    `Check-in: ${fmt(v.check_in)}`,
    `Check-out: ${fmt(v.check_out)}`,
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
