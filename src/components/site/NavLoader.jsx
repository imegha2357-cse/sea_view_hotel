'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MIN_MS = 650; // long enough to see the logo, short enough not to slow anyone down
const MAX_MS = 6000; // never stays up if a page fails to load

const isPlainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented;

// The Sea View logo appears whenever a link or button takes the visitor to another page of the site,
// and fades away once the new page is ready. Links to sections of the same page, new tabs, downloads,
// phone, email and WhatsApp links are left alone. With "reduce motion" the logo shows without pulsing.
export default function NavLoader() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [on, setOn] = useState(false);
  const started = useRef(0);
  const timers = useRef([]);
  const first = useRef(true);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const show = () => {
    clear();
    started.current = Date.now();
    setOn(true);
    timers.current.push(setTimeout(() => setOn(false), MAX_MS));
  };
  const hide = () => {
    const wait = Math.max(0, MIN_MS - (Date.now() - started.current));
    clear();
    timers.current.push(setTimeout(() => setOn(false), wait));
  };

  // Start on the click, before the next page has loaded.
  useEffect(() => {
    const onClick = (e) => {
      if (!isPlainClick(e)) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noLoader !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page or #section
      show();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Finish when the new page is on screen. Navigations started by buttons (e.g. after a form)
  // did not pass through a link, so they get a short logo moment here instead.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!on) show();
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => clear, []);

  return (
    <AnimatePresence>
      {on && (
        <motion.div key="nav-loader" className="nav-loader" role="status" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
          <span className="sr-only">Loading the page</span>
          <div className="boot-logo" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="boot-s" src="/brand/s-mark.png" width={256} height={171} alt="" />
            <span className="boot-hotel" data-t="Hotel" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="boot-wm" src="/brand/wordmark-dark.png" width={1114} height={187} alt="" />
            <span className="boot-line" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
