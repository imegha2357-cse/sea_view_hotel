// Server-side check that a request comes from a signed-in staff member who may edit.
// The admin panel sends the staff member's Firebase sign-in token; Firestore itself verifies the
// token when we read admins/{uid} with it (a forged token is refused), so no service account is needed.
import { config } from './firebase';

export const FS = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;

function uidFrom(token) {
  try {
    const p = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return p.user_id || p.sub || null;
  } catch {
    return null;
  }
}

export async function staffFrom(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const uid = token && uidFrom(token);
  if (!uid || !/^[A-Za-z0-9]{10,40}$/.test(uid)) return null;
  const r = await fetch(`${FS}/admins/${uid}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!r.ok) return null;
  const d = await r.json();
  const role = d.fields?.role?.stringValue || 'owner';
  return { uid, token, role, canEdit: role !== 'viewer' };
}

// Every document in a collection, read with the staff member's token (so Firestore rules apply).
export async function listAs(token, col) {
  const out = [];
  let page = '';
  do {
    const r = await fetch(`${FS}/${col}?pageSize=300${page ? `&pageToken=${page}` : ''}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!r.ok) throw new Error(`${col} ${r.status}`);
    const j = await r.json();
    for (const d of j.documents || []) out.push({ id: d.name.split('/').pop(), f: d.fields || {} });
    page = j.nextPageToken || '';
  } while (page);
  return out;
}

export const deleteAs = (token, col, id) => fetch(`${FS}/${col}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
