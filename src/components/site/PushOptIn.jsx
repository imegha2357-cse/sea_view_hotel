'use client';

import { useEffect, useState } from 'react';
import { loadFirebase } from '@/lib/firebase';
import { trackEvent } from '@/lib/analytics';

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const b64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
const idFor = async (endpoint) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint)))].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');

// "Get offer alerts": browser push notifications for offers and festival greetings. Hidden until
// the VAPID key is set in Vercel, and on browsers that cannot receive push.
export default function PushOptIn({ className = 'footer-link' }) {
  const [state, setState] = useState('hidden');
  useEffect(() => {
    if (!KEY || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
    if (Notification.permission === 'denied') return;
    navigator.serviceWorker.ready
      .then((r) => r.pushManager.getSubscription())
      .then((s) => setState(s ? 'on' : 'off'))
      .catch(() => {});
  }, []);
  if (state === 'hidden') return null;
  const subscribe = async () => {
    setState('busy');
    try {
      if ((await Notification.requestPermission()) !== 'granted') return setState('off');
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(KEY) });
      const j = sub.toJSON();
      const { db, F } = await loadFirebase();
      await F.setDoc(F.doc(db, 'push_subs', await idFor(j.endpoint)), { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, created_at: F.serverTimestamp(), lang: document.documentElement.lang.slice(0, 8) });
      trackEvent('push_subscribe');
      setState('on');
    } catch {
      setState('off');
    }
  };
  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready;
    const s = await reg.pushManager.getSubscription();
    await s?.unsubscribe();
    setState('off');
  };
  return (
    <button type="button" className={className} onClick={state === 'on' ? unsubscribe : subscribe} disabled={state === 'busy'} aria-pressed={state === 'on'}>
      {state === 'on' ? 'Stop offer alerts' : 'Get offer alerts'}
    </button>
  );
}
