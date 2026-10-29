// Firebase loads on demand (feature #71): only when someone signs in, opens a dashboard
// or reaches the enquiry form. Pages that never need it never download it.
// Next.js only inlines NEXT_PUBLIC_* values that are written out in full.
const env = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  recaptcha: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  emulators: process.env.NEXT_PUBLIC_USE_EMULATORS === 'true',
};

// Public web config for the "sea-view-hotel" project. These values identify the project and are
// public by design; access is controlled by firestore.rules and Authentication.
const DEFAULTS = {
  apiKey: 'AIzaSyDNpIuuY_cmh6dLaaq8HUe_d5nQJPXy5KY',
  authDomain: 'sea-view-hotel.firebaseapp.com',
  projectId: 'sea-view-hotel',
  storageBucket: 'sea-view-hotel.firebasestorage.app',
  messagingSenderId: '667027835296',
  appId: '1:667027835296:web:56d0d4af24dc17e6c2bcc5',
};

export const config = {
  apiKey: env.apiKey || DEFAULTS.apiKey,
  authDomain: env.authDomain || DEFAULTS.authDomain,
  projectId: env.projectId || DEFAULTS.projectId,
  storageBucket: env.storageBucket || DEFAULTS.storageBucket,
  messagingSenderId: env.messagingSenderId || DEFAULTS.messagingSenderId,
  appId: env.appId || DEFAULTS.appId,
};

export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

export const NOT_CONFIGURED = 'Online enquiries are not connected yet. Please call or WhatsApp us on +91 94894 74968.';

let promise = null;
let loaded = null;

export function loadFirebase() {
  if (!firebaseReady) return Promise.reject(new Error(NOT_CONFIGURED));
  if (!promise) {
    promise = (async () => {
      const [{ initializeApp }, A, F] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
      const app = initializeApp(config);
      // PRD 10.4 abuse protection: Firebase App Check with reCAPTCHA v3, when a site key is supplied.
      if (env.recaptcha && !env.emulators) {
        const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
        initializeAppCheck(app, { provider: new ReCaptchaV3Provider(env.recaptcha), isTokenAutoRefreshEnabled: true });
      }
      const auth = A.getAuth(app);
      const db = F.getFirestore(app);
      if (env.emulators) {
        A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        F.connectFirestoreEmulator(db, '127.0.0.1', 8080);
      }
      loaded = { app, auth, db, A, F };
      return loaded;
    })();
  }
  return promise;
}

// Synchronous access for code that only runs after loadFirebase() has resolved (dashboards).
export function fb() {
  if (!loaded) throw new Error('Firebase is not loaded yet');
  return loaded;
}

// Warm Firebase up in the background (e.g. when the enquiry form scrolls into view).
export function preloadFirebase() {
  if (firebaseReady) loadFirebase().catch(() => {});
}
