'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { loadFirebase } from '@/lib/firebase';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Inner() {
  const q = useSearchParams();
  const [email, setEmail] = useState(q.get('e') || '');
  const [state, setState] = useState('');
  const go = async (e) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setState('bad');
    setState('busy');
    try {
      const { db, F } = await loadFirebase();
      await F.addDoc(F.collection(db, 'unsubscribes'), { email: email.trim().toLowerCase().slice(0, 120), at: F.serverTimestamp() });
      setState('done');
    } catch {
      setState('error');
    }
  };
  if (state === 'done')
    return (
      <div role="status">
        <h1>You are unsubscribed</h1>
        <p>We will not send newsletters to {email} any more.</p>
      </div>
    );
  return (
    <form onSubmit={go} className="panel" style={{ display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Unsubscribe from our newsletter</h1>
      <label className="cm-field">
        <span className="lbl">Your email</span>
        <input className="cm-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <button className="btn solid" disabled={state === 'busy'}>
        Unsubscribe
      </button>
      {state === 'bad' && <p className="form-alert">Enter a valid email.</p>}
      {state === 'error' && <p className="form-alert">Something went wrong. Email sales@hotelseaview.in and we will remove you.</p>}
    </form>
  );
}

export default function Unsubscribe() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
