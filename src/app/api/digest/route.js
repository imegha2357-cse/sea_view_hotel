// Feature #46: a morning email to the front desk listing enquiries that need attention.
// Runs daily from the Vercel cron in vercel.json.
import { db, fmt, mailReady, sendMail } from '@/lib/server-mail';
import { HOTEL } from '@/data/content';
import { SITE_URL } from '@/data/site';

// Pre-arrival (2 days before) and thank-you (the day after check-out) emails to guests who gave an
// email and whose enquiry the team marked Confirmed. Each is sent once (marked on the enquiry).
async function guestEmails(store) {
  const settings = (await store.doc('site/settings').get()).data() || {};
  const snap = await store.collection('booking_enquiries').where('status', '==', 'Confirmed').get();
  const now = new Date(Date.now() + 5.5 * 3600e3);
  const day = (d) => Math.floor((d.getTime() + 5.5 * 3600e3) / 864e5);
  const today = Math.floor(now.getTime() / 864e5);
  for (const doc of snap.docs) {
    const e = doc.data();
    if (!e.email || e.source === 'demo') continue;
    const ci = e.check_in?.toDate?.();
    const co = e.check_out?.toDate?.();
    const first = String(e.guest_name || '').split(' ')[0] || 'there';
    if (ci && !e.mail_prearrival && day(ci) - today === 2) {
      await sendMail({
        to: e.email,
        replyTo: HOTEL.email,
        subject: `See you soon at ${HOTEL.name}, Kanyakumari`,
        text: [
          `Hello ${first},`,
          '',
          `We look forward to welcoming you on ${fmt(e.check_in)}.`,
          settings.check_in ? `Check-in is from ${settings.check_in}.` : '',
          `We are on East Car Street, Kanyakumari. Directions: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL.mapQuery)}`,
          `Sunrise times and the weather: ${SITE_URL}/plan-your-visit`,
          `Need a pick-up from the station or airport? ${SITE_URL}/request/tour`,
          '',
          `Questions? Call or WhatsApp ${HOTEL.phone}.`,
          '',
          `${HOTEL.name}`,
        ]
          .filter((l) => l !== null)
          .join('\n'),
      });
      await doc.ref.update({ mail_prearrival: new Date() }).catch(() => {});
    }
    if (co && !e.mail_thanks && today - day(co) === 1) {
      await sendMail({
        to: e.email,
        replyTo: HOTEL.email,
        subject: `Thank you for staying at ${HOTEL.name}`,
        text: [
          `Hello ${first},`,
          '',
          'Thank you for staying with us in Kanyakumari. We hope you caught a beautiful sunrise.',
          settings.review_link ? `If you have a minute, a review helps other travellers find us: ${settings.review_link}` : '',
          `Tell us what we could do better by replying to this email or on WhatsApp ${HOTEL.phone}.`,
          '',
          `${HOTEL.name}`,
        ].join('\n'),
      });
      await doc.ref.update({ mail_thanks: new Date() }).catch(() => {});
    }
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const none = () => new Response(null, { status: 204 });

const OPEN = ['New', 'Contacted', 'Availability Checked', 'Awaiting Guest'];

export async function GET(req) {
  if (process.env.CRON_SECRET && req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response(null, { status: 401 });
  const store = db();
  if (!store || !mailReady()) return none();
  await guestEmails(store).catch(() => {});
  if (!process.env.STAFF_EMAIL) return none();
  const snap = await store.collection('booking_enquiries').where('status', 'in', OPEN).get();
  const rows = snap.docs.map((d) => d.data()).filter((e) => e.source !== 'demo');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const isNew = rows.filter((e) => e.status === 'New');
  const due = rows.filter((e) => e.follow_up_at?.toDate && e.follow_up_at.toDate() < tomorrow);
  const arriving = rows.filter((e) => e.check_in?.toDate && e.check_in.toDate() >= today && e.check_in.toDate() < new Date(today.getTime() + 3 * 86400000));
  if (!isNew.length && !due.length && !arriving.length) return none();
  const list = (t, a) => (a.length ? `${t} (${a.length})\n${a.map((e) => `- ${e.guest_name}, ${e.phone}, ${fmt(e.check_in)} to ${fmt(e.check_out)}, ${e.status}`).join('\n')}\n` : '');
  await sendMail({
    to: process.env.STAFF_EMAIL,
    subject: `Front desk today: ${isNew.length} new, ${due.length} to follow up`,
    text: [list('Waiting for a first reply', isNew), list('Follow up today or overdue', due), list('Open enquiries arriving in the next 3 days', arriving), 'Open the staff dashboard for details.'].join('\n'),
  });
  return none();
}
