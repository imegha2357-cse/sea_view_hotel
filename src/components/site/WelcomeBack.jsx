'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

// A quiet "Welcome back" line for signed-in guests, once per visit.
export default function WelcomeBack() {
  const { user, profile, start } = useAuth();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem('seaview-signed-in') === '1' && !sessionStorage.getItem('sv-welcomed')) {
        start?.();
        setShow(true);
      }
    } catch {}
  }, [start]);
  if (!show || !user) return null;
  const name = (profile?.name || user.displayName || '').split(' ')[0];
  const close = () => {
    setShow(false);
    try {
      sessionStorage.setItem('sv-welcomed', '1');
    } catch {}
  };
  return (
    <div className="welcome-back" role="status">
      <span>Welcome back{name ? `, ${name}` : ''}.</span>
      <a href="/account" onClick={close}>
        Your enquiries and saved rooms
      </a>
      <button type="button" aria-label="Close" onClick={close}>
        ×
      </button>
    </div>
  );
}
