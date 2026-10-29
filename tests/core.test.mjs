// Unit tests for the booking logic (feature #79). Run with: npm test
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { emptyEnquiry, enquiryMessage, nights, validateEnquiry, waLink, whatsappUrl, todayISO } from '../src/lib/enquiry.js';
import { blockedInStay, nightsBetween } from '../src/lib/availability.js';
import { stayIcs } from '../src/lib/ics.js';
import { sunOn } from '../src/lib/sun.js';
import { PAGES } from '../src/data/routes.js';
import { GEO, ROOMS } from '../src/data/content.js';

const plus = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const good = () => ({ ...emptyEnquiry(), guest_name: 'Asha Rao', phone: '+91 98765 43210', check_in: plus(10), check_out: plus(12), privacy: true });

test('a complete enquiry passes validation', () => {
  assert.deepEqual(validateEnquiry(good()), {});
});

test('required fields and consent are enforced', () => {
  const e = validateEnquiry({ ...emptyEnquiry() });
  for (const k of ['guest_name', 'phone', 'privacy']) assert.ok(e[k], `missing error for ${k}`);
});

test('dates are optional, but one date alone is not accepted', () => {
  const v = good();
  assert.deepEqual(validateEnquiry({ ...v, check_in: '', check_out: '' }), {});
  assert.ok(validateEnquiry({ ...v, check_out: '' }).check_out);
  assert.ok(validateEnquiry({ ...v, check_in: '' }).check_in);
});

test('the WhatsApp enquiry message is complete and safely encoded', () => {
  const v = { ...good(), room_type: 'Executive Suite', message: 'Sea view & early check-in? 100% please #1' };
  const text = enquiryMessage(v);
  assert.match(text, /Asha Rao/);
  assert.match(text, /Executive Suite/);
  assert.match(text, /\+91 98765 43210/);
  const url = waLink(text);
  assert.ok(url.startsWith('https://wa.me/919489474968?text='));
  assert.equal(decodeURIComponent(url.split('text=')[1]), text);
  assert.ok(!/[ &#%]/.test(url.split('text=')[1].replace(/%[0-9A-F]{2}/g, '')));
  const noDates = enquiryMessage({ ...v, check_in: '', check_out: '' });
  assert.match(noDates, /not decided/i);
});

test('phone numbers must have 10 to 13 digits', () => {
  assert.ok(validateEnquiry({ ...good(), phone: '12345' }).phone);
  assert.equal(validateEnquiry({ ...good(), phone: '9876543210' }).phone, undefined);
});

test('check-out must be after check-in, and past dates are refused', () => {
  assert.ok(validateEnquiry({ ...good(), check_out: plus(10) }).check_out);
  assert.ok(validateEnquiry({ ...good(), check_in: plus(-3), check_out: plus(1) }).check_in);
});

test('fully booked nights block the stay', () => {
  const v = good();
  const blocked = blockedInStay([plus(11)], v.check_in, v.check_out);
  assert.deepEqual(blocked, [plus(11)]);
  assert.ok(validateEnquiry(v, { blockedNights: blocked }).check_out);
  // the check-out day itself is not a night of the stay
  assert.deepEqual(blockedInStay([plus(12)], v.check_in, v.check_out), []);
});

test('nights are counted correctly', () => {
  assert.equal(nights(plus(1), plus(4)), 3);
  assert.equal(nightsBetween(plus(1), plus(4)).length, 3);
});

test('newsletter needs an email', () => {
  assert.ok(validateEnquiry({ ...good(), newsletter: true }).email);
});

test('WhatsApp link carries the stay details, URL-encoded', () => {
  const u = whatsappUrl({ ...good(), room_type: 'Executive Suite' });
  assert.ok(u.startsWith('https://wa.me/919489474968?text='));
  const text = decodeURIComponent(u.split('text=')[1]);
  assert.match(text, /Name: Asha Rao/);
  assert.match(text, /Room: Executive Suite/);
});

test('calendar file is valid iCalendar with all-day dates', () => {
  const ics = stayIcs({ check_in: '2027-01-05', check_out: '2027-01-07', room_type: 'Standard Room', guest_name: 'A' });
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTART;VALUE=DATE:20270105/);
  assert.match(ics, /DTEND;VALUE=DATE:20270107/);
});

test('Kanyakumari sunrise is between 5:50 and 6:50 am all year', () => {
  for (let m = 0; m < 12; m++) {
    const { sunrise } = sunOn(GEO, new Date(2027, m, 15));
    const [h, rest] = sunrise.split(':');
    const mins = +h * 60 + parseInt(rest, 10);
    assert.ok(sunrise.endsWith('am') && mins >= 350 && mins <= 410, `${m}: ${sunrise}`);
  }
});

test('every page has a unique title and a description under 170 characters', () => {
  const titles = new Set(PAGES.map((p) => p.title));
  assert.equal(titles.size, PAGES.length);
  for (const p of PAGES) assert.ok(p.description.length > 50 && p.description.length <= 170, p.path);
});

test('no invented prices: rooms without a confirmed rate show none', () => {
  for (const r of ROOMS) assert.ok(r.rate === null || Number.isInteger(r.rate));
});

test('the date helper returns today in YYYY-MM-DD', () => {
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});
