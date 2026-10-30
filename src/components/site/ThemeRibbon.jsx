'use client';

import { useEffect, useRef, useState } from 'react';
import { THEME_TEXT } from '@/data/lists';
import { useSiteData } from '../SiteData';

// Festival greeting chosen in the admin panel (Settings → Festival theme). It sits above the
// fixed header; its height is measured so the header and the sticky tabs move down by exactly
// that much. Guests can close it for the visit.
export default function ThemeRibbon() {
  const { settings } = useSiteData();
  const theme = settings?.theme;
  const [hide, setHide] = useState(true);
  const ref = useRef(null);
  useEffect(() => {
    try {
      setHide(sessionStorage.getItem('sv-ribbon') === theme);
    } catch {
      setHide(false);
    }
  }, [theme]);
  const show = theme && theme !== 'none' && THEME_TEXT[theme] && !hide;
  useEffect(() => {
    const root = document.documentElement;
    if (!show || !ref.current) {
      root.style.removeProperty('--ribbon-h');
      delete root.dataset.ribbon;
      return undefined;
    }
    root.dataset.ribbon = theme;
    const set = () => root.style.setProperty('--ribbon-h', `${ref.current?.offsetHeight || 0}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--ribbon-h');
      delete root.dataset.ribbon;
    };
  }, [show, theme]);
  if (!show) return null;
  return (
    <div ref={ref} className={`ribbon ribbon-${theme}`} role="note">
      <span className="ribbon-art" aria-hidden="true" />
      <span>{THEME_TEXT[theme]}</span>
      <a href="/offers">See offers</a>
      <button
        type="button"
        aria-label="Close the greeting"
        onClick={() => {
          setHide(true);
          try {
            sessionStorage.setItem('sv-ribbon', theme);
          } catch {}
        }}
      >
        ×
      </button>
    </div>
  );
}
