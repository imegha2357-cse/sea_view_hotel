'use client';

import { useEffect, useState } from 'react';
import { THEME_TEXT } from '@/data/lists';
import { useSiteData } from '../SiteData';

// Festival greeting chosen in the admin panel (Settings → Festival theme). Guests can close it.
export default function ThemeRibbon() {
  const { settings } = useSiteData();
  const theme = settings?.theme;
  const [hide, setHide] = useState(true);
  useEffect(() => {
    try {
      setHide(sessionStorage.getItem('sv-ribbon') === theme);
    } catch {
      setHide(false);
    }
    if (theme && theme !== 'none') document.documentElement.dataset.festival = theme;
    return () => delete document.documentElement.dataset.festival;
  }, [theme]);
  if (!theme || theme === 'none' || !THEME_TEXT[theme] || hide) return null;
  return (
    <div className={`ribbon ribbon-${theme}`} role="note">
      <span className="ribbon-art" aria-hidden="true" />
      <span>{THEME_TEXT[theme]}</span>
      <a href="/offers">See offers</a>
      <button
        type="button"
        aria-label="Close"
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
