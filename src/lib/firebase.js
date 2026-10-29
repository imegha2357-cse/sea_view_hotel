// Firebase loads on demand (feature #71): only when someone signs in, opens a dashboard
// or reaches the enquiry form. Pages that never need it never download it.
const env = import.meta.env || {};

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
  apiKey: env.VITE_FIREBASE_API_KEY || DEFAULTS.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULTS.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || DEFAULTS.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULTS.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULTS.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || DEFAULTS.appId,
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
      if (env.VITE_RECAPTCHA_SITE_KEY && env.VITE_USE_EMULATORS !== 'true') {
        const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
        initializeAppCheck(app, { provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
      }
      const auth = A.getAuth(app);
      const db = F.getFirestore(app);
      if (env.VITE_USE_EMULATORS === 'true') {
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
