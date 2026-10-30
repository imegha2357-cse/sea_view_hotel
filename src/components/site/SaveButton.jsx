'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';

// "Save for later" on guides and offers. Saved items appear in the guest's account.
export default function SaveButton({ href, title }) {
  const { user, profile, saveProfile, start } = useAuth();
  const [msg, setMsg] = useState('');
  const items = profile?.saved_items || [];
  const on = items.some((x) => x.href === href);
  const toggle = async () => {
    if (!user) {
      start?.();
      setMsg('Sign in to save this for later.');
      return;
    }
    try {
      await saveProfile({ name: profile?.name || '', phone: profile?.phone || '', saved_items: on ? items.filter((x) => x.href !== href) : [{ href, title: String(title).slice(0, 100) }, ...items].slice(0, 30) });
      if (!on) trackEvent('save_item', { item: href });
      setMsg(on ? 'Removed.' : 'Saved to your account.');
    } catch {
      setMsg('Could not save. Try again.');
    }
  };
  return (
    <span className="save-btn">
      <button type="button" className="text-btn" aria-pressed={on} onClick={toggle}>
        {on ? '♥ Saved' : '♡ Save for later'}
      </button>
      {msg && (
        <small role="status">
          {msg} {!user && <a href={`/login?next=${encodeURIComponent(href)}`}>Sign in</a>}
        </small>
      )}
    </span>
  );
}
