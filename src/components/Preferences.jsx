'use client';

import { useEffect, useState } from 'react';

// Features #81/#82: dark mode and larger text, remembered in this browser.
const KEY = 'seaview-display';
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

export function applyDisplayPrefs(p = read()) {
  const root = document.documentElement;
  if (p.theme === 'dark' || p.theme === 'light') root.dataset.theme = p.theme;
  else delete root.dataset.theme;
  if (p.large) root.dataset.text = 'large';
  else delete root.dataset.text;
  if (p.contrast) root.dataset.contrast = 'high';
  else delete root.dataset.contrast;
  if (p.still) root.dataset.motion = 'reduce';
  else delete root.dataset.motion;
  if (p.lowData) root.dataset.data = 'low';
  else delete root.dataset.data;
  window.dispatchEvent(new Event('sv-display'));
}

export function Preferences() {
  const [p, setP] = useState(read);
  useEffect(() => {
    applyDisplayPrefs(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
  }, [p]);
  const nextTheme = p.theme === 'dark' ? 'light' : 'dark';
  return (
    <>
      <button type="button" className="footer-link" onClick={() => setP((s) => ({ ...s, theme: nextTheme }))} aria-pressed={p.theme === 'dark'}>
        {p.theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      <button type="button" className="footer-link" onClick={() => setP((s) => ({ ...s, large: !s.large }))} aria-pressed={!!p.large}>
        {p.large ? 'Normal text' : 'Larger text'}
      </button>
      <button type="button" className="footer-link" onClick={() => setP((s) => ({ ...s, contrast: !s.contrast }))} aria-pressed={!!p.contrast}>
        {p.contrast ? 'Normal contrast' : 'High contrast'}
      </button>
      <button type="button" className="footer-link" onClick={() => setP((s) => ({ ...s, still: !s.still }))} aria-pressed={!!p.still}>
        {p.still ? 'Allow animation' : 'Reduce motion'}
      </button>
      <button type="button" className="footer-link" onClick={() => setP((s) => ({ ...s, lowData: !s.lowData }))} aria-pressed={!!p.lowData}>
        {p.lowData ? 'Full-quality photos' : 'Save mobile data'}
      </button>
    </>
  );
}
