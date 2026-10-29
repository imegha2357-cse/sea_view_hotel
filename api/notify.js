// Features #11 and #13: when an enquiry arrives, email the front desk and send the guest an acknowledgement.
// Called by the website right after Firestore saves the enquiry. It only acts on enquiries created in the
// last 10 minutes that have not been notified yet, so it cannot be used to spam anyone.
import { db, fmt, mailReady, sendMail } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const id = String(req.body?.id || '');
  const store = db();
  if (!store || !mailReady() || !/^[A-Za-z0-9]{10,40}$/.test(id)) return res.status(204).end();

  const ref = store.collection('booking_enquiries').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(204).end();
  const e = snap.data();
  const age = Date.now() - (e.created_at?.toMillis?.() || 0);
  if (e.notified_at || age > 10 * 60 * 1000 || e.source !== 'website_form') return res.status(204).end();
  await ref.update({ notified_at: new Date() });

  const dates = `${fmt(e.check_in)} to ${fmt(e.check_out)}`;
  const lines = [
    `New ${e.enquiry_type || 'stay'} enquiry from the website`,
    '',
    `Name: ${e.guest_name}`,
    `Phone: ${e.phone}`,
    `Email: ${e.email || '-'}`,
    `Dates: ${dates}`,
    `Guests: ${e.adults} adults, ${e.children} children${e.event_guests ? ` (event: ${e.event_guests})` : ''}`,
    `Room: ${e.room_type || 'No preference'}`,
    e.pickup && e.pickup !== 'none' ? `Pick-up: ${e.pickup}` : '',
    e.addons?.length ? `Extras: ${e.addons.join(', ')}` : '',
    e.callback_time ? `Best time to call: ${e.callback_time}` : '',
    e.message ? `\nMessage:\n${e.message}` : '',
    '',
    'Open the staff dashboard to reply and update the status.',
  ].filter((l) => l !== '');

  const jobs = [];
  if (process.env.STAFF_EMAIL) jobs.push(sendMail({ to: process.env.STAFF_EMAIL, subject: `New enquiry: ${e.guest_name}, ${dates}`, text: lines.join('\n'), replyTo: e.email || undefined }));
  if (e.email)
    jobs.push(
      sendMail({
        to: e.email,
        subject: 'We have received your enquiry - Hotel Sea View, Kanyakumari',
        text: `Dear ${e.guest_name},\n\nThank you for your enquiry for ${dates}. This is a request, not a confirmed booking. Our team will call or WhatsApp you on ${e.phone} to confirm availability, price and booking terms.\n\nHotel Sea View\nEast Car Street, Kanyakumari 629 702\n+91 94894 74968`,
        replyTo: process.env.STAFF_EMAIL || undefined,
      })
    );
  await Promise.allSettled(jobs);
  return res.status(204).end();
}
