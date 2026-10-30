// Next.js settings. Pages are pre-built as static HTML; images are optimised on Vercel or by Cloudinary.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com https://www.gstatic.com https://www.google.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://hotelseaview.in https://*.google-analytics.com https://*.googletagmanager.com https://*.gstatic.com https://*.googleapis.com https://*.googleusercontent.com",
  "media-src 'self' https://res.cloudinary.com",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.open-meteo.com https://www.google.com",
  "frame-src https://www.google.com https://sea-view-hotel.firebaseapp.com https://accounts.google.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // HD only: the smallest copy any visitor gets is 640px (phones), up to 2560px on large screens.
    deviceSizes: [640, 828, 1080, 1200, 1920, 2560],
    imageSizes: [64, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
  },
  async headers() {
    return [
      { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
  async redirects() {
    // Old WordPress addresses on hotelseaview.in, so links and Google results land on the right new page
    // once the domain points here.
    const old = [
      ['/hotel-sea-view-kanyakumari', '/'],
      ['/accommodations', '/rooms'],
      ['/accommodation', '/rooms'],
      ['/restaurant', '/dining'],
      ['/bar', '/dining#bar'],
      ['/conference-hall', '/meetings'],
      ['/reservaton', '/enquire'],
      ['/reservation', '/enquire'],
      ['/contact', '/contact'],
      ['/accommodation/:slug*', '/rooms'],
      ['/room-type/:slug*', '/rooms'],
      ['/rooms-2/:slug*', '/rooms'],
    ].filter(([a, b]) => a !== b);
    return [{ source: '/admin/', destination: '/admin', permanent: true }, { source: '/request/agent', destination: '/contact', permanent: true }, ...old.map(([source, destination]) => ({ source, destination, permanent: true }))];
  },
};
