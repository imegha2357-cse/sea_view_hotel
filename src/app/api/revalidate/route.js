// Called by the admin panel after a save, so the public pages show the change straight away.
// Only staff can trigger it: the request carries the staff member's Firebase sign-in token, and
// Firestore itself confirms the token and that admins/{uid} exists (it can only read its own record).
import { revalidatePath, revalidateTag } from 'next/cache';
import { staffFrom } from '@/lib/staff-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const staff = await staffFrom(req);
  if (!staff) return Response.json({ ok: false }, { status: 401 });
  revalidateTag('cms');
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
