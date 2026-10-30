// Sends a newsletter to everyone who ticked "send me offers" (Firestore newsletter collection),
// through Resend. Staff only. Addresses that unsubscribed are skipped. With { test: true } it goes
// only to the staff member's own email.
import { staffFrom, listAs } from '@/lib/staff-server';
import { HOTEL } from '@/data/content';
import { SITE_URL } from '@/data/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  const staff = await staffFrom(req);
  if (!staff?.canEdit) return Response.json({ error: 'Only staff who can edit may send newsletters.' }, { status: 403 });
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) return Response.json({ error: 'Email is not switched on yet. Add RESEND_API_KEY and MAIL_FROM in Vercel.' }, { status: 400 });
  const { subject, text, test, me } = await req.json().catch(() => ({}));
  if (!subject?.trim() || !text?.trim() || subject.length > 150 || text.length > 8000) return Response.json({ error: 'Write a subject (up to 150 characters) and a message.' }, { status: 400 });

  let to;
  if (test) {
    if (!EMAIL.test(me || '')) return Response.json({ error: 'No email for the test.' }, { status: 400 });
    to = [me];
  } else {
    const [subs, unsubs] = await Promise.all([listAs(staff.token, 'newsletter'), listAs(staff.token, 'unsubscribes').catch(() => [])]);
    const gone = new Set(unsubs.map((u) => (u.f.email?.stringValue || '').toLowerCase()));
    to = [...new Set(subs.map((s) => (s.f.email?.stringValue || '').toLowerCase()))].filter((e) => EMAIL.test(e) && !gone.has(e));
  }
  if (!to.length) return Response.json({ error: 'There are no subscribers yet.' }, { status: 400 });

  const body = (email) =>
    `${text.trim()}\n\n—\n${HOTEL.name}, East Car Street, Kanyakumari\nCall or WhatsApp ${HOTEL.phone} · ${SITE_URL}\n\nYou are receiving this because you signed up on our website. Unsubscribe: ${SITE_URL}/unsubscribe?e=${encodeURIComponent(email)}`;
  let sent = 0;
  const failed = [];
  // Resend batch API: up to 100 emails per call, each sent separately (no one sees other addresses).
  for (let i = 0; i < to.length; i += 100) {
    const chunk = to.slice(i, i + 100);
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk.map((e) => ({ from: process.env.MAIL_FROM, to: [e], subject: subject.trim(), text: body(e), reply_to: HOTEL.email, headers: { 'List-Unsubscribe': `<${SITE_URL}/unsubscribe?e=${encodeURIComponent(e)}>` } }))),
    });
    if (r.ok) sent += chunk.length;
    else failed.push(`${r.status}`);
  }
  return Response.json({ sent, total: to.length, failed: failed.length ? failed : undefined });
}
