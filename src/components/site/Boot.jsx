'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureSource } from '@/lib/attribution';
import { initErrorReporting } from '@/lib/errors';
import { initSmoothScroll } from '@/lib/scroll';

// Things every page needs once in the browser: smooth scrolling, campaign source, error reports, offline cache.
export default function Boot() {
  const pathname = usePathname();
  useEffect(() => {
    captureSource();
    initErrorReporting();
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  // Lenis smooth scroll on the public site only (dashboards keep native scrolling).
  useEffect(() => {
    if (/^\/(admin|account|login)/.test(pathname)) return undefined;
    return initSmoothScroll();
  }, [pathname]);
  // Loader fallback: some responses (like "page not found") replace the document after the head
  // script ran, so make sure the logo loader is dismissed once React is running.
  useEffect(() => {
    const d = document.documentElement;
    if (d.dataset.boot === 'done') return undefined;
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem('sv-boot'));
    } catch {}
    const t = setTimeout(() => {
      d.dataset.boot = 'done';
      try {
        sessionStorage.setItem('sv-boot', '1');
      } catch {}
    }, seen ? 0 : 900);
    return () => clearTimeout(t);
  }, [pathname]);
  // New page: start at the top unless a #section was asked for.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
