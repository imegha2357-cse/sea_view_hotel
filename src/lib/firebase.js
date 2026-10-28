import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const env = import.meta.env;

// Firebase web config for the "sea-view-hotel" project. These values identify the project and are
// public by design; access is controlled by firestore.rules and Authentication, not by hiding them.
// VITE_FIREBASE_* environment variables override them (e.g. for a staging project).
const DEFAULTS = {
  apiKey: 'AIzaSyDNpIuuY_cmh6dLaaq8HUe_d5nQJPXy5KY',
  authDomain: 'sea-view-hotel.firebaseapp.com',
  projectId: 'sea-view-hotel',
  storageBucket: 'sea-view-hotel.firebasestorage.app',
  messagingSenderId: '667027835296',
  appId: '1:667027835296:web:56d0d4af24dc17e6c2bcc5',
};

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || DEFAULTS.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULTS.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || DEFAULTS.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULTS.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULTS.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || DEFAULTS.appId,
};

// The public site still renders without Firebase; forms and logins show a clear setup message instead.
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

export const app = firebaseReady ? initializeApp(config) : null;
// PRD 10.4 abuse protection: Firebase App Check with reCAPTCHA v3, when a site key is supplied.
// After it reports traffic in the console, turn on enforcement for Firestore and Authentication.
if (app && env.VITE_RECAPTCHA_SITE_KEY && env.VITE_USE_EMULATORS !== 'true') {
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

if (app && env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export const NOT_CONFIGURED =
  'Online enquiries are not connected yet. Please call or WhatsApp us on +91 94894 74968.';
