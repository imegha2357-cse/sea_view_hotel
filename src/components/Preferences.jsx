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
    </>
  );
}
