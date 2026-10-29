// Feature #46: a morning email to the front desk listing enquiries that need attention.
// Runs daily from the Vercel cron in vercel.json.
import { db, fmt, mailReady, sendMail } from './_lib.js';

const OPEN = ['New', 'Contacted', 'Availability Checked', 'Awaiting Guest'];

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();
  const store = db();
  if (!store || !mailReady() || !process.env.STAFF_EMAIL) return res.status(204).end();
  const snap = await store.collection('booking_enquiries').where('status', 'in', OPEN).get();
  const rows = snap.docs.map((d) => d.data()).filter((e) => e.source !== 'demo');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const isNew = rows.filter((e) => e.status === 'New');
  const due = rows.filter((e) => e.follow_up_at?.toDate && e.follow_up_at.toDate() < tomorrow);
  const arriving = rows.filter((e) => e.check_in?.toDate && e.check_in.toDate() >= today && e.check_in.toDate() < new Date(today.getTime() + 3 * 86400000));
  if (!isNew.length && !due.length && !arriving.length) return res.status(204).end();
  const list = (t, a) => (a.length ? `${t} (${a.length})\n${a.map((e) => `- ${e.guest_name}, ${e.phone}, ${fmt(e.check_in)} to ${fmt(e.check_out)}, ${e.status}`).join('\n')}\n` : '');
  await sendMail({
    to: process.env.STAFF_EMAIL,
    subject: `Front desk today: ${isNew.length} new, ${due.length} to follow up`,
    text: [list('Waiting for a first reply', isNew), list('Follow up today or overdue', due), list('Open enquiries arriving in the next 3 days', arriving), 'Open the staff dashboard for details.'].join('\n'),
  });
  return res.status(204).end();
}
