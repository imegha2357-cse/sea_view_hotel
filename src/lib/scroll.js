import Lenis from 'lenis';

// Smooth scrolling for the public pages, with a lock used by menus, sheets and modals.
let lenis = null;
let locks = 0;

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll() {
  if (lenis || reduced()) return () => {};
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -72 } });
  let id;
  const raf = (t) => {
    lenis?.raf(t);
    id = requestAnimationFrame(raf);
  };
  id = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(id);
    lenis?.destroy();
    lenis = null;
  };
}

export function lockScroll() {
  locks += 1;
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks) return;
  lenis?.start();
  document.documentElement.style.overflow = '';
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
}
