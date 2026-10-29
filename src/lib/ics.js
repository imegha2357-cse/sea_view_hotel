import { HOTEL } from '../data/content';

// Feature #97: "Add to calendar" for a stay, as an .ics file that phones and Outlook open.
const pad = (n) => String(n).padStart(2, '0');
const ymd = (iso) => iso.replace(/-/g, '');
const esc = (s) => String(s).replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');

export function stayIcs({ check_in, check_out, room_type, guest_name }) {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hotel Sea View//Stay//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@hotelseaview.in`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(check_in)}`,
    `DTEND;VALUE=DATE:${ymd(check_out)}`,
    `SUMMARY:${esc(`Stay at ${HOTEL.name}, ${HOTEL.city}`)}`,
    `LOCATION:${esc(HOTEL.addressLines.join(', '))}`,
    `DESCRIPTION:${esc(`${room_type || 'Room'} for ${guest_name || 'guest'}. Phone ${HOTEL.phone}.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadText(filename, text, type = 'text/calendar') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const toISODate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
