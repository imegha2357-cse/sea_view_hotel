import { firebaseReady, loadFirebase } from './firebase';

// Feature #78: report front-end errors to staff (Dashboard → Inbox). Only the message, page and browser
// are sent, never form contents. At most three reports per visit.
let sent = 0;
const seen = new Set();

export function reportError(message) {
  const msg = String(message || 'Unknown error').slice(0, 500);
  if (!firebaseReady || sent >= 3 || seen.has(msg) || process.env.NODE_ENV === 'development') return;
  // Ignore noise from browser extensions and cancelled media loads.
  if (/extension:|ResizeObserver loop|AbortError|Load failed|NetworkError/i.test(msg)) return;
  seen.add(msg);
  sent++;
  loadFirebase()
    .then(({ db, F }) =>
      F.addDoc(F.collection(db, 'client_errors'), {
        message: msg,
        page: window.location.pathname.slice(0, 200),
        ua: navigator.userAgent.slice(0, 200),
        at: F.serverTimestamp(),
      })
    )
    .catch(() => {});
}

export function initErrorReporting() {
  window.addEventListener('error', (e) => reportError(e.message || e.error?.message));
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason?.message || String(e.reason)));
}

export async function sendFeedback(message) {
  const { db, F } = await loadFirebase();
  return F.addDoc(F.collection(db, 'feedback'), {
    message: String(message).trim().slice(0, 1000),
    page: window.location.pathname.slice(0, 200),
    created_at: F.serverTimestamp(),
  });
}
