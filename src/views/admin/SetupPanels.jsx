'use client';

import { useEffect, useState } from 'react';
import { fb } from '@/lib/firebase';
import { clearDemo, loadDemo } from '@/lib/demo-data';

const authed = async (path, opts = {}) => {
  const token = await fb().auth.currentUser?.getIdToken();
  const r = await fetch(path, { ...opts, headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`);
  return j;
};
const useStatus = () => {
  const [s, setS] = useState(null);
  useEffect(() => {
    authed('/api/setup-status').then(setS).catch(() => setS({}));
  }, []);
  return s;
};
const count = async (col) => {
  const { db, F } = fb();
  try {
    return (await F.getCountFromServer(F.collection(db, col))).data().count;
  } catch {
    return null;
  }
};

// ---------- Newsletter and offer alerts ----------
export function NewsletterPanel({ me, canEdit }) {
  const st = useStatus();
  const [n, setN] = useState({ subs: null, push: null });
  const [mail, setMail] = useState({ subject: '', text: '' });
  const [push, setPush] = useState({ title: '', body: '', url: '/offers' });
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState('');
  useEffect(() => {
    Promise.all([count('newsletter'), count('push_subs')]).then(([subs, p]) => setN({ subs, push: p }));
  }, []);
  const send = async (kind, test) => {
    setBusy(kind + (test ? '-test' : ''));
    setMsg((m) => ({ ...m, [kind]: null }));
    try {
      if (kind === 'mail') {
        if (!test && !window.confirm(`Send "${mail.subject}" to all ${n.subs ?? ''} subscribers? This cannot be undone.`)) return;
        const j = await authed('/api/newsletter', { method: 'POST', body: JSON.stringify({ ...mail, test, me }) });
        setMsg((m) => ({ ...m, mail: { ok: true, text: test ? `Test sent to ${me}.` : `Sent to ${j.sent} of ${j.total} subscribers.` } }));
      } else {
        if (!window.confirm(`Send this alert to ${n.push ?? 'all'} browsers?`)) return;
        const j = await authed('/api/push', { method: 'POST', body: JSON.stringify(push) });
        setMsg((m) => ({ ...m, push: { ok: true, text: `Sent to ${j.sent} of ${j.total} browsers${j.removed ? ` (${j.removed} old ones removed)` : ''}.` } }));
      }
    } catch (e) {
      setMsg((m) => ({ ...m, [kind]: { ok: false, text: e.message } }));
    } finally {
      setBusy('');
    }
  };
  const M = ({ m }) => (m ? <p className={m.ok ? 'cm-ok' : 'form-alert'}>{m.text}</p> : null);
  return (
    <>
      <section className="panel cm-editor">
        <h2>Newsletter ({n.subs ?? '…'} subscribers)</h2>
        {st && !st.mail && <p className="info-box">Email is not switched on yet. Add RESEND_API_KEY and MAIL_FROM in Vercel (see Setup checklist).</p>}
        <fieldset disabled={!canEdit || !st?.mail} className="cm-fields">
          <label className="cm-field">
            <span className="lbl">Subject</span>
            <input className="cm-input" value={mail.subject} maxLength={150} onChange={(e) => setMail((x) => ({ ...x, subject: e.target.value }))} placeholder="e.g. Monsoon weekends by the sea" />
          </label>
          <label className="cm-field">
            <span className="lbl">Message</span>
            <textarea className="cm-input" rows={8} value={mail.text} maxLength={8000} onChange={(e) => setMail((x) => ({ ...x, text: e.target.value }))} />
            <small className="meta">Plain text. The hotel address, phone and an unsubscribe link are added at the bottom automatically.</small>
          </label>
          <div className="form-actions">
            <button type="button" className="btn outline sm" onClick={() => send('mail', true)} disabled={!mail.subject || !mail.text || busy}>
              Send a test to me
            </button>
            <button type="button" className="btn solid sm" onClick={() => send('mail', false)} disabled={!mail.subject || !mail.text || busy}>
              {busy === 'mail' && <span className="spin" aria-hidden="true" />}
              Send to all subscribers
            </button>
          </div>
        </fieldset>
        <M m={msg.mail} />
      </section>
      <section className="panel cm-editor">
        <h2>Offer alerts ({n.push ?? '…'} browsers)</h2>
        <p className="meta">Guests tap "Get offer alerts" in the website footer. Alerts appear on their phone or computer even when the website is closed. Send them rarely.</p>
        {st && !st.push && <p className="info-box">Alerts are not switched on yet. Create the keys in Setup checklist, then add them in Vercel.</p>}
        <fieldset disabled={!canEdit || !st?.push} className="cm-fields">
          <div className="cm-grid">
            <label className="cm-field">
              <span className="lbl">Title</span>
              <input className="cm-input" value={push.title} maxLength={80} onChange={(e) => setPush((x) => ({ ...x, title: e.target.value }))} placeholder="e.g. Happy Pongal from Hotel Sea View" />
            </label>
            <label className="cm-field">
              <span className="lbl">Opens page</span>
              <input className="cm-input" value={push.url} onChange={(e) => setPush((x) => ({ ...x, url: e.target.value }))} placeholder="/offers" />
            </label>
          </div>
          <label className="cm-field">
            <span className="lbl">Message</span>
            <input className="cm-input" value={push.body} maxLength={200} onChange={(e) => setPush((x) => ({ ...x, body: e.target.value }))} />
          </label>
          <button type="button" className="btn solid sm" onClick={() => send('push')} disabled={!push.title || busy}>
            {busy === 'push' && <span className="spin" aria-hidden="true" />}
            Send alert
          </button>
        </fieldset>
        <M m={msg.push} />
      </section>
    </>
  );
}

// ---------- Setup checklist ----------
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function makeVapid() {
  const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = b64url(await crypto.subtle.exportKey('raw', k.publicKey));
  const jwk = await crypto.subtle.exportKey('jwk', k.privateKey);
  return { pub, priv: jwk.d };
}
const ITEMS = [
  ['mail', 'Emails to guests and staff', 'RESEND_API_KEY, MAIL_FROM', 'Pre-arrival and thank-you emails, the newsletter, and new-enquiry alerts.'],
  ['serviceAccount', 'Automatic daily emails', 'FIREBASE_SERVICE_ACCOUNT', 'Lets the daily 8 am job read confirmed stays to send pre-arrival and thank-you emails.'],
  ['staffEmail', 'Front desk morning email', 'STAFF_EMAIL', 'Where the daily list of enquiries to follow up goes.'],
  ['ai', 'AI chat assistant', 'ANTHROPIC_API_KEY', 'Smarter, conversational answers. Without it the built-in answers are used.'],
  ['push', 'Offer alerts', 'NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY', 'Push notifications to guests who opt in.'],
  ['recaptcha', 'Spam protection', 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY', 'Blocks bots from filling in the forms (Firebase App Check).'],
  ['cloudinary', 'Faster photos', 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'Serves photos from Cloudinary’s image network.'],
  ['analytics', 'Visitor statistics', 'NEXT_PUBLIC_GA_ID', 'Google Analytics, only for visitors who accept cookies.'],
];
function DemoData({ me, canEdit }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const run = async (kind) => {
    if (kind === 'clear' && !window.confirm('Remove all demo data?')) return;
    setBusy(kind);
    setMsg(null);
    try {
      if (kind === 'load') setMsg({ ok: true, text: `Added ${(await loadDemo(me)).join(', ')}. Open Requests, Housekeeping, Menu and News to see them.` });
      else {
        await clearDemo(me);
        setMsg({ ok: true, text: 'Demo data removed.' });
      }
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy('');
    }
  };
  return (
    <section className="panel">
      <h2>Demo data</h2>
      <p className="meta">Fills the panel with sample data so you can try it: 15 requests, 15 rooms on the housekeeping board, 15 menu dishes (hidden from guests) and 3 draft posts. Guests never see any of it. Remove it before going live.</p>
      <div className="form-actions">
        <button type="button" className="btn solid sm" disabled={!canEdit || busy} onClick={() => run('load')}>
          {busy === 'load' && <span className="spin" aria-hidden="true" />}
          Load demo data
        </button>
        <button type="button" className="btn outline sm" disabled={!canEdit || busy} onClick={() => run('clear')}>
          {busy === 'clear' && <span className="spin" aria-hidden="true" />}
          Remove demo data
        </button>
      </div>
      {msg && <p className={msg.ok ? 'cm-ok' : 'form-alert'}>{msg.text}</p>}
    </section>
  );
}

export function SetupPanel({ me, canEdit }) {
  const st = useStatus();
  const [keys, setKeys] = useState(null);
  return (
    <>
    <DemoData me={me} canEdit={canEdit} />
    <section className="panel">
      <p className="meta">
        Each service is switched on by adding its key in Vercel: Project → Settings → Environment Variables, then Redeploy. Keys are never shown here. The full step-by-step guide is in the setup document.
      </p>
      <ul className="setup-list">
        {ITEMS.map(([k, title, env, what]) => (
          <li key={k} className={st?.[k] ? 'on' : ''}>
            <span className="setup-dot" aria-hidden="true">
              {st?.[k] ? '✓' : ''}
            </span>
            <div>
              <b>{title}</b> <span className={`pill ${st?.[k] ? 'st-Confirmed' : 'st-New'}`}>{st ? (st[k] ? 'On' : 'Not set up') : '…'}</span>
              <p className="meta">{what}</p>
              <code>{env}</code>
            </div>
          </li>
        ))}
      </ul>
      <h2>Create the keys for offer alerts</h2>
      <p className="meta">These keys are made here in your browser and are not saved anywhere. Copy both into Vercel straight away. Keep the private key secret; anyone with it could send alerts as the hotel.</p>
      {keys ? (
        <div className="cm-fields">
          <label className="cm-field">
            <span className="lbl">NEXT_PUBLIC_VAPID_PUBLIC_KEY</span>
            <input className="cm-input" readOnly value={keys.pub} onFocus={(e) => e.target.select()} />
          </label>
          <label className="cm-field">
            <span className="lbl">VAPID_PRIVATE_KEY (secret)</span>
            <input className="cm-input" readOnly value={keys.priv} onFocus={(e) => e.target.select()} />
          </label>
        </div>
      ) : (
        <button type="button" className="btn outline sm" onClick={async () => setKeys(await makeVapid())} disabled={st?.push}>
          {st?.push ? 'Already set up' : 'Create keys'}
        </button>
      )}
    </section>
    </>
  );
}
