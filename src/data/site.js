// The address search engines should treat as the main copy of the site. Change VITE_SITE_URL
// (in Vercel project settings) when the hotel's own domain points here.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://seaviewhotel-8x42.vercel.app').replace(/\/$/, '');
