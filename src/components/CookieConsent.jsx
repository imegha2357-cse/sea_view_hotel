import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { analyticsEnabled, getConsent, loadAnalytics, setConsent, trackEvent, trackPage } from '../lib/analytics';
import { EASE } from './Motion';

// Shown only when analytics is configured. Declining is as easy as accepting, nothing is pre-selected,
// and the choice can be changed later from "Cookie settings" in the footer.
export default function CookieConsent() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) return undefined;
    if (getConsent() === null) setOpen(true);
    else loadAnalytics();
    const reopen = () => setOpen(true);
    const onClick = (e) => {
      const a = e.target.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.includes('wa.me/')) trackEvent('whatsapp_click', { location: a.className || 'link' });
      else if (href.startsWith('tel:')) trackEvent('call_click', { location: a.className || 'link' });
      else if (href.includes('google.com/maps')) trackEvent('directions_click');
    };
    window.addEventListener('seaview:cookie-settings', reopen);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('seaview:cookie-settings', reopen);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    trackPage(pathname);
  }, [pathname]);

  if (!analyticsEnabled) return null;

  const choose = (v) => {
    setConsent(v);
    setOpen(false);
    if (v === 'granted') setTimeout(() => trackPage(pathname), 500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="consent" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-text" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <div>
            <h2 id="consent-title">Cookies</h2>
            <p id="consent-text">
              We would like to use analytics cookies to understand how visitors use this site. They are off unless you allow them. Read the <Link to="/privacy">privacy notice</Link>.
            </p>
          </div>
          <div className="consent-actions">
            <button className="btn outline" onClick={() => choose('denied')}>
              Decline
            </button>
            <button className="btn solid" onClick={() => choose('granted')}>
              Allow analytics
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const openCookieSettings = () => window.dispatchEvent(new Event('seaview:cookie-settings'));
