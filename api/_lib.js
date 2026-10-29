// Shared helpers for the serverless functions. Everything is optional: with no keys set, the functions
// do nothing and return 204, so the website works the same.
//   FIREBASE_SERVICE_ACCOUNT  JSON of a Firebase service account (Project settings → Service accounts)
//   RESEND_API_KEY            key from resend.com for sending email
//   MAIL_FROM                 e.g. "Hotel Sea View <enquiries@hotelseaview.in>" (a domain verified in Resend)
//   STAFF_EMAIL               where new-enquiry alerts and the daily digest go, e.g. sales@hotelseaview.in
//   CRON_SECRET               set by Vercel for cron calls
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function db() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(raw)) });
  return getFirestore();
}

export const mailReady = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

export async function sendMail({ to, subject, text, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text, reply_to: replyTo }),
  });
  if (!res.ok) throw new Error(`mail ${res.status}`);
}

export const fmt = (ts) => (ts?.toDate ? ts.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '');
