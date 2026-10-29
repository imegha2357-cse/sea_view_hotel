// Serves a photo uploaded in the admin panel. Photos are stored in Firestore (collection "media") as
// compressed WebP; each upload gets a new id, so responses are cached for a year by browsers and Vercel.
import { config } from '@/lib/firebase';

export const runtime = 'nodejs';

const BASE = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;

export async function GET(_req, { params }) {
  const id = String(params.id || '');
  if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) return new Response('Not found', { status: 404 });
  const r = await fetch(`${BASE}/media/${id}?key=${config.apiKey}`, { cache: 'no-store' });
  if (!r.ok) return new Response('Not found', { status: r.status === 404 ? 404 : 502, headers: { 'Cache-Control': 'no-store' } });
  const f = (await r.json()).fields || {};
  const data = f.data?.stringValue;
  const mime = f.mime?.stringValue || 'image/webp';
  if (!data || !/^image\/(webp|jpeg|png)$/.test(mime)) return new Response('Not found', { status: 404 });
  const bytes = Buffer.from(data, 'base64');
  return new Response(bytes, {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
