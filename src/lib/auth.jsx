import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseReady, NOT_CONFIGURED } from './firebase';

const AuthContext = createContext(null);

async function loadRole(uid) {
  // Admin access is granted only by an admins/{uid} document, which clients cannot write (see firestore.rules).
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists() ? 'admin' : 'guest';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return undefined;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const [r, p] = await Promise.all([loadRole(u.uid), getDoc(doc(db, 'users', u.uid))]);
        setRole(r);
        setProfile(p.exists() ? p.data() : null);
      } catch {
        setRole('guest');
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      profile,
      loading,
      isAdmin: role === 'admin',
      async login(email, password) {
        if (!firebaseReady) throw new Error(NOT_CONFIGURED);
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const r = await loadRole(cred.user.uid);
        setRole(r);
        return r;
      },
      async register({ name, phone, email, password }) {
        if (!firebaseReady) throw new Error(NOT_CONFIGURED);
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        const data = { name: name.trim(), phone: phone.trim(), email: email.trim(), role: 'guest', createdAt: serverTimestamp() };
        await setDoc(doc(db, 'users', cred.user.uid), data);
        setProfile(data);
        setRole('guest');
      },
      async saveProfile({ name, phone }) {
        const data = { name: name.trim(), phone: phone.trim() };
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        await updateProfile(user, { displayName: data.name });
        setProfile((p) => ({ ...(p || {}), ...data }));
      },
      resetPassword(email) {
        if (!firebaseReady) throw new Error(NOT_CONFIGURED);
        return sendPasswordResetEmail(auth, email.trim());
      },
      logout() {
        return firebaseReady ? signOut(auth) : Promise.resolve();
      },
    }),
    [user, role, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function authMessage(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'That email and password do not match. Check them and try again.';
  if (code.includes('email-already-in-use')) return 'An account already uses this email. Sign in instead.';
  if (code.includes('weak-password')) return 'Use a password of at least 8 characters.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes, then try again.';
  if (code.includes('network')) return 'No connection. Check your internet and try again.';
  return err?.message || 'Something went wrong. Please try again.';
}
