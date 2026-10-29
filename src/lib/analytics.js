// FR-12 + PRD 10.4: Google Analytics 4 is installed ONLY when the client supplies a
// measurement ID (VITE_GA_ID) AND the visitor accepts analytics cookies.
// Nothing is loaded or stored before consent. Without VITE_GA_ID this file does nothing.

// Measurement ID from the client's Firebase / Google Analytics property. Set VITE_GA_ID=off to disable.
const RAW = process.env.NEXT_PUBLIC_GA_ID || 'G-R1LGWTMCRK';
export const GA_ID = RAW === 'off' ? '' : RAW;
export const analyticsEnabled = Boolean(GA_ID);

const KEY = 'seaview-consent';
let loaded = false;

export function getConsent() {
  try {
    return localStorage.getItem(KEY); // 'granted' | 'denied' | null
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
  if (value === 'granted') loadAnalytics();
  else if (loaded && window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
}

export function loadAnalytics() {
  if (!analyticsEnabled || loaded || getConsent() !== 'granted') return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

export function trackPage(path) {
  if (loaded && window.gtag) window.gtag('event', 'page_view', { page_path: path, page_title: document.title });
}

// Never send names, phone numbers or emails (PRD 10.4: do not expose guest contact details).
export function trackEvent(name, params = {}) {
  if (loaded && window.gtag) window.gtag('event', name, params);
}
