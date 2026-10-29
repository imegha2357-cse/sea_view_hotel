import localFont from 'next/font/local';

// Fonts are bundled with the site (no request to Google), preloaded and swapped in without layout jumps.
export const display = localFont({
  src: [
    { path: './../fonts/playfair-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './../fonts/playfair-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './../fonts/playfair-display-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './../fonts/playfair-display-latin-500-italic.woff2', weight: '500', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const body = localFont({
  src: [
    { path: './../fonts/figtree-latin-400-normal.woff2', weight: '400' },
    { path: './../fonts/figtree-latin-500-normal.woff2', weight: '500' },
    { path: './../fonts/figtree-latin-600-normal.woff2', weight: '600' },
    { path: './../fonts/figtree-latin-700-normal.woff2', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});
