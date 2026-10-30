// Sends a push notification (offers, festival greetings) to every browser that tapped
// "Get offer alerts". Staff only. Needs NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel
// (the admin panel can generate a pair). Subscriptions that no longer exist are removed.
import webpush from 'web-push';
import { deleteAs, listAs, staffFrom } from '@/lib/staff-server';
import { HOTEL } from '@/data/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const staff = await staffFrom(req);
  if (!staff?.canEdit) return Response.json({ error: 'Only staff who can edit may send alerts.' }, { status: 403 });
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return Response.json({ error: 'Push alerts are not switched on yet. Add the two VAPID keys in Vercel.' }, { status: 400 });
  const { title, body, url } = await req.json().catch(() => ({}));
  if (!title?.trim() || title.length > 80 || (body || '').length > 200) return Response.json({ error: 'Write a title (up to 80 characters) and a short message.' }, { status: 400 });
  const link = /^\/[\w\-/#?=&.]*$/.test(url || '') ? url : '/offers';
  webpush.setVapidDetails(`mailto:${HOTEL.email}`, pub, priv);
  const subs = await listAs(staff.token, 'push_subs');
  const payload = JSON.stringify({ title: title.trim(), body: (body || '').trim(), url: link });
  let sent = 0;
  let removed = 0;
  await Promise.all(
    subs.map(async (s) => {
      const sub = { endpoint: s.f.endpoint?.stringValue, keys: { p256dh: s.f.p256dh?.stringValue, auth: s.f.auth?.stringValue } };
      if (!sub.endpoint) return;
      try {
        await webpush.sendNotification(sub, payload, { TTL: 86400 });
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          removed++;
          await deleteAs(staff.token, 'push_subs', s.id);
        }
      }
    })
  );
  return Response.json({ sent, total: subs.length, removed });
}
