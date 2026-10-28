import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROOM_TYPES } from '../data/content';
import { emptyEnquiry, MESSAGE_MAX, submitEnquiry, todayISO, validateEnquiry, whatsappUrl, nights } from '../lib/enquiry';
import { useAuth } from '../lib/auth';
import { CheckCircle, ChatIcon } from './Icons';
import { EASE } from './Motion';

function Field({ id, label, error, children, className = '', staticLabel }) {
  return (
    <div className={`field ${error ? 'invalid' : ''} ${staticLabel ? 'static' : ''} ${className}`}>
      {children}
      <label htmlFor={id}>{label}</label>
      {/* #91 calm validation: slides down 6px, never shakes */}
      <AnimatePresence>
        {error && (
          <motion.div className="err" id={`${id}-err`} role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
            <i aria-hidden="true">!</i>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// #97 number rolls up or down
function Counter({ label, value, min, max, onChange, hint }) {
  const [dir, setDir] = useState(1);
  const set = (n) => {
    setDir(n > value ? 1 : -1);
    onChange(n);
  };
  return (
    <div className="counter">
      <span className="lbl">
        <small>{label}</small>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{hint}</span>
      </span>
      <span className="ctrl">
        <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          −
        </button>
        <span className="roll" aria-live="polite">
          <AnimatePresence initial={false} custom={dir}>
            <motion.span key={value} custom={dir} initial={{ y: `${dir * 100}%`, opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: `${dir * -100}%`, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </span>
    </div>
  );
}

export default function EnquiryForm({ prefill, compact = false, onSubmitted }) {
  const { user, profile } = useAuth();
  const [v, setV] = useState(() => emptyEnquiry(profile || (user ? { email: user.email, name: user.displayName } : null)));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [serverError, setServerError] = useState('');
  const [doneData, setDoneData] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (prefill) setV((s) => ({ ...s, ...prefill }));
  }, [prefill]);

  useEffect(() => {
    if (profile) setV((s) => ({ ...s, guest_name: s.guest_name || profile.name || '', phone: s.phone || profile.phone || '', email: s.email || profile.email || '' }));
  }, [profile]);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setV((s) => {
      const next = { ...s, [k]: val };
      if (touched) setErrors(validateEnquiry(next));
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validateEnquiry(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    setState('sending');
    setServerError('');
    try {
      await submitEnquiry(v, user);
      setDoneData(v);
      setState('done');
      onSubmitted?.();
    } catch (err) {
      setState('error');
      setServerError(
        err?.code === 'permission-denied'
          ? 'We could not accept that enquiry. Please check the details, or message us on WhatsApp.'
          : err?.message || 'Your enquiry was not sent. Check your connection and try again, or message us on WhatsApp.'
      );
    }
  };

  const describedBy = (k) => (errors[k] ? `${k}-err` : undefined);

  return (
    <div className="form-card">
      <AnimatePresence mode="wait">
        {state === 'done' && doneData ? (
          // #93 success panel, shown only after Firestore confirms the write
          <motion.div key="done" className="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} role="status">
            <CheckCircle />
            <h3>Enquiry received</h3>
            <dl className="summary">
              <dt>Name</dt>
              <dd>{doneData.guest_name}</dd>
              <dt>Dates</dt>
              <dd>
                {doneData.check_in} to {doneData.check_out} ({nights(doneData.check_in, doneData.check_out)} nights)
              </dd>
              <dt>Guests</dt>
              <dd>
                {doneData.adults} adults, {doneData.children} children
              </dd>
              {doneData.room_type && (
                <>
                  <dt>Room</dt>
                  <dd>{doneData.room_type}</dd>
                </>
              )}
            </dl>
            <p className="form-note">This is a request, not a confirmed booking. Our team will call or WhatsApp you on {doneData.phone} to confirm availability, price and booking terms.</p>
            <div className="form-actions">
              {user ? (
                <Link to="/account" className="btn outline">
                  View my enquiries
                </Link>
              ) : (
                <Link to="/login" className="btn outline">
                  Create an account to track it
                </Link>
              )}
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setState('idle');
                  setV(emptyEnquiry(profile));
                  setTouched(false);
                  setErrors({});
                }}
              >
                Send another enquiry
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" ref={formRef} onSubmit={submit} noValidate exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} aria-label="Booking enquiry">
            <div className="form-grid">
              <Field id="guest_name" label="Full name *" error={errors.guest_name}>
                <input id="guest_name" name="guest_name" placeholder=" " autoComplete="name" value={v.guest_name} onChange={set('guest_name')} maxLength={80} aria-invalid={!!errors.guest_name} aria-describedby={describedBy('guest_name')} />
              </Field>
              <Field id="phone" label="Phone / WhatsApp *" error={errors.phone}>
                <input id="phone" name="phone" placeholder=" " type="tel" autoComplete="tel" inputMode="tel" value={v.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} />
              </Field>
              <Field id="email" label="Email (optional)" error={errors.email} className="full">
                <input id="email" name="email" placeholder=" " type="email" autoComplete="email" value={v.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} />
              </Field>
              <Field id="check_in" label="Check-in *" error={errors.check_in} staticLabel>
                <input id="check_in" name="check_in" type="date" min={todayISO()} value={v.check_in} onChange={set('check_in')} aria-invalid={!!errors.check_in} aria-describedby={describedBy('check_in')} />
              </Field>
              <Field id="check_out" label="Check-out *" error={errors.check_out} staticLabel>
                <input id="check_out" name="check_out" type="date" min={v.check_in || todayISO()} value={v.check_out} onChange={set('check_out')} aria-invalid={!!errors.check_out} aria-describedby={describedBy('check_out')} />
              </Field>
              <Counter label="Adults" hint="Age 6+" value={+v.adults} min={1} max={8} onChange={(n) => setV((s) => ({ ...s, adults: n }))} />
              <Counter label="Children" hint="Under 6" value={+v.children} min={0} max={6} onChange={(n) => setV((s) => ({ ...s, children: n }))} />
              <Field id="room_type" label="Room preference" error={errors.room_type} className="full" staticLabel>
                <select id="room_type" name="room_type" value={v.room_type} onChange={set('room_type')}>
                  <option value="">No preference</option>
                  {ROOM_TYPES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              {!compact && (
                <Field id="message" label="Special requests (optional)" error={errors.message} className="full">
                  <textarea id="message" name="message" placeholder=" " value={v.message} onChange={set('message')} maxLength={MESSAGE_MAX + 50} aria-describedby="message-count" />
                  <div className="hint" id="message-count">
                    {v.message.length} / {MESSAGE_MAX}
                  </div>
                </Field>
              )}
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" tabIndex={-1} autoComplete="off" value={v.company} onChange={set('company')} />
              </div>
              <div className="full">
                <label className="check">
                  <input type="checkbox" name="privacy" checked={v.privacy} onChange={set('privacy')} aria-invalid={!!errors.privacy} aria-describedby={describedBy('privacy')} />
                  <span>
                    I have read the <Link to="/privacy">privacy notice</Link> and agree that Hotel Sea View may contact me about this enquiry. *
                  </span>
                </label>
                <AnimatePresence>
                  {errors.privacy && (
                    <motion.div className="field" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <div className="err" id="privacy-err" role="alert">
                        <i aria-hidden="true">!</i>
                        {errors.privacy}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {state === 'error' && (
                <div className="full form-alert" role="alert">
                  {serverError}
                </div>
              )}
              <div className="full form-actions">
                {/* #92 submit states */}
                <button className="btn solid submit-btn" type="submit" disabled={state === 'sending'} aria-busy={state === 'sending'}>
                  {state === 'sending' ? (
                    <>
                      <span className="spin" aria-hidden="true" /> Sending…
                    </>
                  ) : (
                    'Send enquiry'
                  )}
                </button>
                <a className="btn outline wa" href={whatsappUrl(v)} target="_blank" rel="noreferrer">
                  <ChatIcon /> Send on WhatsApp
                </a>
              </div>
              <p className="full form-note">This sends a request to our team. It does not confirm a booking or hold a room.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
