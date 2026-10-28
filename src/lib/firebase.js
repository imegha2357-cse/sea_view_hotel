import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
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
