// The old WordPress site on hotelseaview.in was hacked and filled with casino spam posts
// (May 2026). Once the domain points to this site, those addresses answer "410 Gone" so search
// engines drop them quickly, instead of a soft 404. WordPress system addresses get the same.
import { NextResponse } from 'next/server';
import { WA_REQUESTS, waRequest } from './data/wa-requests';

const GONE = /^\/(uncategorized|category|tag|author|feed|comments|wp-admin|wp-login\.php|wp-content|wp-includes|wp-json|xmlrpc\.php|wp-sitemap|\d{4}\/\d{2})(\/|$|\.|-)/;

export function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;
  // Group, corporate, gift and call-back requests now go straight to WhatsApp.
  const wa = pathname.match(/^\/request\/(group|corporate|gift|callback)\/?$/);
  if (wa && WA_REQUESTS[wa[1]]) return NextResponse.redirect(waRequest(wa[1]), 307);
  if (GONE.test(pathname) || (pathname === '/' && (searchParams.has('p') || searchParams.has('page_id') || searchParams.has('s') || searchParams.has('cat')))) {
    return new NextResponse('This page no longer exists. Visit https://hotelseaview.in/ for Hotel Sea View, Kanyakumari.', { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/request/(group|corporate|gift|callback)', '/(uncategorized|category|tag|author|feed|comments|wp-admin|wp-content|wp-includes|wp-json|wp-sitemap)/:path*', '/(wp-login.php|xmlrpc.php|wp-sitemap.xml)', '/(2019|2020|2021|2022|2023|2024|2025|2026|2027)/:path*'],
};
