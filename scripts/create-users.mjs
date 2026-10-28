// Creates (or updates) the two starter logins:
//   1. an ADMIN account, listed in the `admins` collection so it can open /admin
//   2. a GUEST account, with a `users` profile, for testing /account
//
// Needs a service-account key (Firebase console > Project settings > Service accounts > Generate new private key).
// Fill ADMIN_* and GUEST_* in .env, then run:  npm run create-users
// Passwords are never printed or stored by this script.
import { readFile } from 'node:fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Minimal .env reader so no extra dependency is needed
try {
  const raw = await readFile(new URL('../.env', import.meta.url), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const need = ['GOOGLE_APPLICATION_CREDENTIALS', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'GUEST_EMAIL', 'GUEST_PASSWORD'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing in .env: ${missing.join(', ')}`);
  process.exit(1);
}
for (const k of ['ADMIN_PASSWORD', 'GUEST_PASSWORD']) {
  if (process.env[k].length < 10) {
    console.error(`${k} must be at least 10 characters.`);
    process.exit(1);
  }
}

const key = JSON.parse(await readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
initializeApp({ credential: cert(key) });
const auth = getAuth();
const db = getFirestore();

async function upsert(email, password, displayName) {
  try {
    const u = await auth.getUserByEmail(email);
    await auth.updateUser(u.uid, { password, displayName });
    console.log(`updated ${email}`);
    return u.uid;
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
    const u = await auth.createUser({ email, password, displayName, emailVerified: true });
    console.log(`created ${email}`);
    return u.uid;
  }
}

const adminUid = await upsert(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, process.env.ADMIN_NAME || 'Admin');
await db.doc(`admins/${adminUid}`).set({ email: process.env.ADMIN_EMAIL, createdAt: FieldValue.serverTimestamp() }, { merge: true });
console.log('  -> granted admin access (admins collection)');

const guestUid = await upsert(process.env.GUEST_EMAIL, process.env.GUEST_PASSWORD, process.env.GUEST_NAME || 'Guest');
await db.doc(`users/${guestUid}`).set(
  { name: process.env.GUEST_NAME || 'Guest', phone: '', email: process.env.GUEST_EMAIL, role: 'guest', createdAt: FieldValue.serverTimestamp() },
  { merge: true }
);
console.log('  -> guest profile ready');

console.log('\nDone. Admin signs in at /admin/login, guest at /login.');
process.exit(0);
