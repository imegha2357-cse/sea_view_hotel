import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { firebaseReady, loadFirebase, NOT_CONFIGURED } from './firebase';

const AuthContext = createContext(null);
const FLAG = 'seaview-signed-in';
const flag = {
  get: () => {
    try {
      return localStorage.getItem(FLAG) === '1';
    } catch {
      return false;
    }
  },
  set: (on) => {
    try {
      on ? localStorage.setItem(FLAG, '1') : localStorage.removeItem(FLAG);
    } catch {}
  },
};

// Pages that always need the signed-in state.
const NEEDS_AUTH = /^\/(login|account|admin)/;

async function loadStaff(fbx, uid) {
  // Staff access is granted only by an admins/{uid} document, which clients cannot write (see firestore.rules).
  const snap = await fbx.F.getDoc(fbx.F.doc(fbx.db, 'admins', uid));
  return snap.exists() ? { role: 'admin', staffRole: snap.data().role || 'owner' } : { role: 'guest', staffRole: null };
}

export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [staffRole, setStaffRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const unsub = useRef(null);

  const start = useCallback(() => {
    if (started || !firebaseReady) return;
    setStarted(true);
    setLoading(true);
    loadFirebase()
      .then((fbx) => {
        unsub.current = fbx.A.onAuthStateChanged(fbx.auth, async (u) => {
          setUser(u);
          flag.set(Boolean(u));
          if (!u) {
            setRole(null);
            setStaffRole(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          try {
            const [s, p] = await Promise.all([loadStaff(fbx, u.uid), fbx.F.getDoc(fbx.F.doc(fbx.db, 'users', u.uid))]);
            setRole(s.role);
            setStaffRole(s.staffRole);
            setProfile(p.exists() ? p.data() : null);
          } catch {
            setRole('guest');
          }
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, [started]);

  // Load Firebase only when this visitor has signed in before, or opens a page that needs it.
  useEffect(() => {
    if (NEEDS_AUTH.test(pathname) || flag.get()) start();
  }, [pathname, start]);
  useEffect(() => () => unsub.current?.(), []);

  const value = useMemo(
    () => ({
      user,
      role,
      staffRole,
      profile,
      loading: loading || (NEEDS_AUTH.test(pathname) && !started),
      isAdmin: role === 'admin',
      canEdit: role === 'admin' && staffRole !== 'viewer',
      start,
      async login(email, password) {
        if (!firebaseReady) throw new Error(NOT_CONFIGURED);
        start();
        const fbx = await loadFirebase();
        const cred = await fbx.A.signInWithEmailAndPassword(fbx.auth, email.trim(), password);
        const s = await loadStaff(fbx, cred.user.uid);
        setRole(s.role);
        setStaffRole(s.staffRole);
        flag.set(true);
        return s.role;
      },
      // Feature #31: sign in with Google. A guest profile is created on first sign-in.
      async loginWithGoogle() {
        start();
        const fbx = await loadFirebase();
        const cred = await fbx.A.signInWithPopup(fbx.auth, new fbx.A.GoogleAuthProvider());
        const ref = fbx.F.doc(fbx.db, 'users', cred.user.uid);
        const snap = await fbx.F.getDoc(ref);
        const s = await loadStaff(fbx, cred.user.uid);
        if (!snap.exists() && s.role !== 'admin') {
          const data = { name: (cred.user.displayName || '').slice(0, 80), phone: '', email: cred.user.email || '', role: 'guest', createdAt: fbx.F.serverTimestamp() };
          await fbx.F.setDoc(ref, data);
          setProfile(data);
        } else if (snap.exists()) setProfile(snap.data());
        setRole(s.role);
        setStaffRole(s.staffRole);
        flag.set(true);
        return s.role;
      },
      async register({ name, phone, email, password }) {
        if (!firebaseReady) throw new Error(NOT_CONFIGURED);
        start();
        const fbx = await loadFirebase();
        const cred = await fbx.A.createUserWithEmailAndPassword(fbx.auth, email.trim(), password);
        await fbx.A.updateProfile(cred.user, { displayName: name.trim() });
        const data = { name: name.trim(), phone: phone.trim(), email: email.trim(), role: 'guest', createdAt: fbx.F.serverTimestamp() };
        await fbx.F.setDoc(fbx.F.doc(fbx.db, 'users', cred.user.uid), data);
        setProfile(data);
        setRole('guest');
        flag.set(true);
      },
      async saveProfile(patch) {
        const fbx = await loadFirebase();
        const data = { name: (patch.name ?? profile?.name ?? '').trim(), phone: (patch.phone ?? profile?.phone ?? '').trim() };
        if (patch.preferences) data.preferences = patch.preferences;
        if (patch.saved_rooms) data.saved_rooms = patch.saved_rooms;
        const ref = fbx.F.doc(fbx.db, 'users', user.uid);
        const exists = (await fbx.F.getDoc(ref)).exists();
        if (exists) await fbx.F.updateDoc(ref, data);
        else await fbx.F.setDoc(ref, { ...data, email: user.email || '', role: 'guest', createdAt: fbx.F.serverTimestamp() });
        if (data.name && data.name !== user.displayName) await fbx.A.updateProfile(user, { displayName: data.name });
        setProfile((p) => ({ ...(p || {}), ...data }));
      },
      async resetPassword(email) {
        if (!firebaseReady) throw new Error(NOT_CONFIGURED);
        const fbx = await loadFirebase();
        return fbx.A.sendPasswordResetEmail(fbx.auth, email.trim());
      },
      async logout() {
        flag.set(false);
        if (!started) return;
        const fbx = await loadFirebase();
        await fbx.A.signOut(fbx.auth);
      },
    }),
    [user, role, staffRole, profile, loading, started, pathname, start]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Feature #84: sign staff and guests out after 30 minutes without activity.
export function useIdleSignOut(minutes = 30) {
  const { user, logout } = useAuth();
  const [warn, setWarn] = useState(false);
  useEffect(() => {
    if (!user) return undefined;
    let t1;
    let t2;
    const reset = () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setWarn(false);
      t1 = setTimeout(() => setWarn(true), (minutes - 1) * 60000);
      t2 = setTimeout(() => logout(), minutes * 60000);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'visibilitychange'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, minutes, logout]);
  return warn;
}

export function authMessage(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'That email and password do not match. Check them and try again.';
  if (code.includes('email-already-in-use')) return 'An account already uses this email. Sign in instead.';
  if (code.includes('weak-password')) return 'Use a password of at least 8 characters.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes, then try again.';
  if (code.includes('popup-closed')) return 'The Google window was closed before signing in.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the Google window. Allow pop-ups and try again.';
  if (code.includes('operation-not-allowed')) return 'Google sign-in is not switched on yet. Use email and password for now.';
  if (code.includes('unauthorized-domain')) return 'This web address is not yet allowed for Google sign-in.';
  if (code.includes('requires-recent-login')) return 'For your security, sign out and sign in again, then retry.';
  if (code.includes('network')) return 'No connection. Check your internet and try again.';
  return err?.message || 'Something went wrong. Please try again.';
}
