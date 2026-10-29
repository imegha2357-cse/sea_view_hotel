// Called by the admin panel after a save, so the public pages show the change straight away.
// Only staff can trigger it: the request carries the staff member's Firebase sign-in token, and
// Firestore itself confirms the token and that admins/{uid} exists (it can only read its own record).
import { revalidatePath, revalidateTag } from 'next/cache';
import { config } from '@/lib/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;

function uidFrom(token) {
  try {
    const p = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return p.user_id || p.sub || null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const uid = token && uidFrom(token);
  if (!uid || !/^[A-Za-z0-9]{10,40}$/.test(uid)) return Response.json({ ok: false }, { status: 401 });
  const r = await fetch(`${BASE}/admins/${uid}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!r.ok) return Response.json({ ok: false }, { status: 403 });
  revalidateTag('cms');
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
