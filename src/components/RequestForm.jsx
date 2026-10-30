'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { firebaseReady, loadFirebase, preloadFirebase } from '@/lib/firebase';
import { todayISO, waLink } from '@/lib/enquiry';
import { trackEvent } from '@/lib/analytics';
import { REQUEST_TYPES } from '@/data/lists';
import { useSiteData } from './SiteData';
import { EASE } from './site/ui';

const PHONE = /^\+?[0-9][0-9 -]{6,16}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// One form for all the "ask us" requests (groups, corporate, gift, tours, table, celebrations,
// agents, call back, in-stay). Saved for the staff (Hotel → Requests) and sent on WhatsApp.
export default function RequestForm({ type, fields, roomNumber = '', submitLabel = 'Send request', compact = false }) {
  const { user, profile } = useAuth();
  const { rooms } = useSiteData();
  const [v, setV] = useState(() => ({ name: profile?.name || '', phone: profile?.phone || '', email: user?.email || '', message: '', room_number: roomNumber, ...Object.fromEntries(fields.map((f) => [f.key, ''])) }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!v.name.trim()) e.name = 'Please enter your name.';
    if (!PHONE.test(v.phone.trim())) e.phone = 'Enter a phone number we can call or WhatsApp.';
    if (v.email && !EMAIL.test(v.email.trim())) e.email = 'This email does not look right.';
    for (const f of fields) if (f.required && !String(v[f.key] || '').trim()) e[f.key] = `Please fill in ${f.label.toLowerCase()}.`;
    for (const f of fields) if (f.type === 'number' && v[f.key] && !(Number(v[f.key]) > 0)) e[f.key] = 'Enter a number.';
    const ci = v.check_in || v.date;
    if (ci && ci < todayISO()) e[v.check_in ? 'check_in' : 'date'] = 'Pick today or a later date.';
    if (v.check_in && v.check_out && v.check_out <= v.check_in) e.check_out = 'Departure must be after arrival.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const filled = Object.fromEntries(fields.filter((f) => String(v[f.key] || '').trim()).map((f) => [f.label.replace(/\s*\(.*\)$/, '').slice(0, 40), String(v[f.key]).trim().slice(0, 200)]));
    const lines = [`${REQUEST_TYPES[type]} request from ${v.name.trim()}`, `Phone: ${v.phone.trim()}`, v.email && `Email: ${v.email.trim()}`, v.room_number && `Room: ${v.room_number}`, ...Object.entries(filled).map(([k, x]) => `${k}: ${x}`), v.message.trim() && `Message: ${v.message.trim()}`].filter(Boolean);
    const text = lines.join('\n');
    let saved = false;
    if (firebaseReady) {
      try {
        const { db, F } = await loadFirebase();
        await F.addDoc(F.collection(db, 'requests'), {
          type,
          name: v.name.trim().slice(0, 80),
          phone: v.phone.trim(),
          email: v.email.trim() || null,
          fields: filled,
          message: v.message.trim().slice(0, 1000),
          room_number: String(v.room_number || '').slice(0, 10),
          status: 'New',
          userId: user?.uid || null,
          created_at: F.serverTimestamp(),
          updated_at: F.serverTimestamp(),
          lang: (typeof document !== 'undefined' && document.documentElement.lang.slice(0, 8)) || 'en',
        });
        saved = true;
      } catch {
        /* WhatsApp below still carries the request */
      }
    }
    trackEvent('request_sent', { request_type: type, saved });
    setDone({ saved, link: waLink(text) });
    setBusy(false);
  };

  if (done)
    return (
      <motion.div className="req-done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} role="status">
        <h3>{done.saved ? 'Thank you, we have your request.' : 'Almost there.'}</h3>
        <p>{done.saved ? 'Our team will reply soon. For a faster answer, send it on WhatsApp too.' : 'We could not save it online. Please send it to us on WhatsApp.'}</p>
        <a className="btn solid" href={done.link} target="_blank" rel="noopener noreferrer">
          Send on WhatsApp
        </a>
      </motion.div>
    );

  const input = (f) => {
    const common = { id: `rq-${f.key}`, name: f.key, value: v[f.key], onChange: set(f.key), 'aria-invalid': !!errors[f.key], 'aria-describedby': errors[f.key] ? `rq-${f.key}-err` : undefined };
    if (f.type === 'select')
      return (
        <select {...common}>
          <option value="">Choose…</option>
          {f.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    if (f.type === 'room')
      return (
        <select {...common}>
          <option value="">Any room</option>
          {rooms.map((r) => (
            <option key={r.id}>{r.name}</option>
          ))}
        </select>
      );
    if (f.type === 'date') return <input {...common} type="date" min={f.key === 'check_out' ? v.check_in || todayISO() : todayISO()} />;
    if (f.type === 'time') return <input {...common} type="time" />;
    if (f.type === 'number') return <input {...common} type="number" min={1} max={999} inputMode="numeric" placeholder=" " />;
    return <input {...common} placeholder=" " maxLength={120} />;
  };
  const field = (id, label, el, { full, stat, req } = {}) => (
    <div key={id} className={`field ${errors[id] ? 'invalid' : ''} ${stat ? 'static' : ''} ${full ? 'full' : ''}`}>
      {el}
      <label htmlFor={`rq-${id}`}>
        {label}
        {req ? ' *' : ''}
      </label>
      <AnimatePresence>
        {errors[id] && (
          <motion.div className="err" id={`rq-${id}-err`} role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <i aria-hidden="true">!</i>
            {errors[id]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <form className={`req-form ${compact ? 'compact' : ''}`} onSubmit={submit} onFocus={() => preloadFirebase()} noValidate>
      <div className="form-grid">
        {field('name', 'Your name', <input id="rq-name" value={v.name} onChange={set('name')} autoComplete="name" placeholder=" " maxLength={80} aria-invalid={!!errors.name} />, { req: true })}
        {field('phone', 'Phone / WhatsApp', <input id="rq-phone" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={set('phone')} placeholder=" " aria-invalid={!!errors.phone} />, { req: true })}
        {!compact && field('email', 'Email (optional)', <input id="rq-email" type="email" autoComplete="email" value={v.email} onChange={set('email')} placeholder=" " aria-invalid={!!errors.email} />, { full: true })}
        {fields.map((f) => field(f.key, f.label, input(f), { stat: ['date', 'time', 'select', 'room'].includes(f.type), req: f.required }))}
        {field('message', 'Anything else? (optional)', <textarea id="rq-message" rows={3} value={v.message} onChange={set('message')} maxLength={1000} placeholder=" " />, { full: true })}
      </div>
      <div className="form-actions">
        <button className="btn solid" disabled={busy}>
          {busy && <span className="spin" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
      <p className="meta">No payment is taken on the website. Our team confirms everything with you directly.</p>
    </form>
  );
}
