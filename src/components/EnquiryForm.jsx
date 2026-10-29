'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@/lib/router';
import { OFFERS, ROOM_TYPES } from '../data/content';
import {
  ADDONS,
  CALLBACK_TIMES,
  draft,
  emptyEnquiry,
  ENQUIRY_TYPES,
  estimate,
  MESSAGE_MAX,
  nightsLabel,
  offerFor,
  PICKUPS,
  rupees,
  submitEnquiry,
  todayISO,
  validateEnquiry,
  whatsappUrl,
} from '../lib/enquiry';
import { blockedInStay, fetchBlockedDates } from '../lib/availability';
import { preloadFirebase } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { trackEvent } from '../lib/analytics';
import { downloadText, stayIcs } from '../lib/ics';
import AvailabilityCalendar from './AvailabilityCalendar';
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

export default function EnquiryForm({ prefill, compact = false, onSubmitted, defaultType = 'stay' }) {
  const { user, profile } = useAuth();
  const [v, setV] = useState(() => ({ ...emptyEnquiry(profile || (user ? { email: user.email, name: user.displayName } : null)), enquiry_type: defaultType }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [serverError, setServerError] = useState('');
  const [doneData, setDoneData] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [showCal, setShowCal] = useState(false);
  const [saved, setSaved] = useState(() => draft.load());
  const formRef = useRef(null);
  const cardRef = useRef(null);

  // Warm up Firebase and load booked dates once the form is near the screen.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          preloadFirebase();
          fetchBlockedDates().then(setBlocked);
          io.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (prefill) {
      setV((s) => ({ ...s, ...prefill }));
      setSaved(null);
    }
  }, [prefill]);

  useEffect(() => {
    if (profile) setV((s) => ({ ...s, guest_name: s.guest_name || profile.name || '', phone: s.phone || profile.phone || '', email: s.email || profile.email || '' }));
  }, [profile]);

  // Feature #10: keep a draft while the guest types.
  useEffect(() => {
    if (state !== 'idle' && state !== 'error') return undefined;
    const t = setTimeout(() => draft.save(v), 600);
    return () => clearTimeout(t);
  }, [v, state]);

  const blockedNights = useMemo(() => blockedInStay(blocked, v.check_in, v.check_out), [blocked, v.check_in, v.check_out]);
  const est = estimate(v);
  const offer = offerFor(v.promo_code);
  const isStay = v.enquiry_type === 'stay';

  const update = (patch) =>
    setV((s) => {
      const next = { ...s, ...patch };
      if (touched) setErrors(validateEnquiry(next, { blockedNights: blockedInStay(blocked, next.check_in, next.check_out) }));
      return next;
    });
  const set = (k) => (e) => update({ [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggleAddon = (id) => update({ addons: v.addons.includes(id) ? v.addons.filter((a) => a !== id) : [...v.addons, id] });

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validateEnquiry(v, { blockedNights });
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
      draft.clear();
      trackEvent('generate_lead', { method: 'website_form', room_type: v.room_type || 'any', enquiry_type: v.enquiry_type });
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
    <div className="form-card" ref={cardRef}>
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
                {doneData.check_in} to {doneData.check_out} ({nightsLabel(doneData.check_in, doneData.check_out)})
              </dd>
              <dt>Guests</dt>
              <dd>
                {doneData.enquiry_type === 'stay' ? `${doneData.adults} adults, ${doneData.children} children` : `${doneData.event_guests || 'Not given'} guests`}
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
              <button type="button" className="btn outline" onClick={() => downloadText('hotel-sea-view-stay.ics', stayIcs(doneData))}>
                Save dates to calendar
              </button>
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
                  setV({ ...emptyEnquiry(profile), enquiry_type: defaultType });
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
            {saved && (
              <div className="draft-bar" role="status">
                <span>You started an enquiry earlier{saved.check_in ? ` for ${saved.check_in}` : ''}. Continue it?</span>
                <span className="draft-actions">
                  <button type="button" className="text-btn" onClick={() => { setV((s) => ({ ...s, ...saved, privacy: false })); setSaved(null); }}>
                    Restore
                  </button>
                  <button type="button" className="text-btn muted" onClick={() => { draft.clear(); setSaved(null); }}>
                    Discard
                  </button>
                </span>
              </div>
            )}
            <div className="form-grid">
              <div className="full type-switch" role="radiogroup" aria-label="What are you enquiring about?">
                {ENQUIRY_TYPES.map((t) => (
                  <label key={t.id} className={v.enquiry_type === t.id ? 'on' : ''}>
                    <input type="radio" name="enquiry_type" value={t.id} checked={v.enquiry_type === t.id} onChange={set('enquiry_type')} />
                    {t.label}
                  </label>
                ))}
              </div>
              <Field id="guest_name" label="Full name *" error={errors.guest_name}>
                <input id="guest_name" name="guest_name" placeholder=" " autoComplete="name" value={v.guest_name} onChange={set('guest_name')} maxLength={80} aria-invalid={!!errors.guest_name} aria-describedby={describedBy('guest_name')} />
              </Field>
              <Field id="phone" label="Phone / WhatsApp *" error={errors.phone}>
                <input id="phone" name="phone" placeholder=" " type="tel" autoComplete="tel" inputMode="tel" value={v.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} />
              </Field>
              <Field id="email" label="Email (optional)" error={errors.email} className="full">
                <input id="email" name="email" placeholder=" " type="email" autoComplete="email" value={v.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} />
              </Field>
              <Field id="check_in" label={isStay ? 'Check-in *' : 'Event date *'} error={errors.check_in} staticLabel>
                <input id="check_in" name="check_in" type="date" min={todayISO()} value={v.check_in} onChange={set('check_in')} aria-invalid={!!errors.check_in} aria-describedby={describedBy('check_in')} />
              </Field>
              <Field id="check_out" label={isStay ? 'Check-out *' : 'Until *'} error={errors.check_out} staticLabel>
                <input id="check_out" name="check_out" type="date" min={v.check_in || todayISO()} value={v.check_out} onChange={set('check_out')} aria-invalid={!!errors.check_out} aria-describedby={describedBy('check_out')} />
              </Field>
              <div className="full">
                <button type="button" className="text-btn" onClick={() => setShowCal((s) => !s)} aria-expanded={showCal}>
                  {showCal ? 'Hide availability calendar' : 'Pick dates on the availability calendar'}
                </button>
                <AnimatePresence initial={false}>
                  {showCal && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ overflow: 'hidden' }}>
                      <AvailabilityCalendar blocked={blocked} value={{ check_in: v.check_in, check_out: v.check_out }} onChange={(d) => update(d)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isStay ? (
                <>
                  <Counter label="Adults" hint="Age 6+" value={+v.adults} min={1} max={8} onChange={(n) => update({ adults: n })} />
                  <Counter label="Children" hint="Under 6" value={+v.children} min={0} max={6} onChange={(n) => update({ children: n })} />
                  <Field id="room_type" label="Room preference" error={errors.room_type} className="full" staticLabel>
                    <select id="room_type" name="room_type" value={v.room_type} onChange={set('room_type')}>
                      <option value="">No preference</option>
                      {ROOM_TYPES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                </>
              ) : (
                <Field id="event_guests" label="Number of guests (approx.)" error={errors.event_guests} className="full">
                  <input id="event_guests" name="event_guests" placeholder=" " type="number" inputMode="numeric" min="1" max="1000" value={v.event_guests} onChange={set('event_guests')} />
                </Field>
              )}

              {est && (
                <div className="full estimate" aria-live="polite">
                  <span>
                    Estimate for {est.nights} {est.nights === 1 ? 'night' : 'nights'} from {rupees(est.perNight)} a night
                  </span>
                  <b>{rupees(est.total)}</b>
                  <small>Final price is confirmed by our team.</small>
                </div>
              )}

              {!compact && (
                <details className="full more-opts">
                  <summary>Pick-up, extras and when to call you</summary>
                  <div className="more-grid">
                    <Field id="pickup" label="Pick-up" staticLabel>
                      <select id="pickup" name="pickup" value={v.pickup} onChange={set('pickup')}>
                        {PICKUPS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id="callback_time" label="Best time to call" staticLabel>
                      <select id="callback_time" name="callback_time" value={v.callback_time} onChange={set('callback_time')}>
                        {CALLBACK_TIMES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    {isStay && (
                      <fieldset className="addons">
                        <legend>Extras (we will confirm prices)</legend>
                        {ADDONS.map((a) => (
                          <label key={a.id} className="check">
                            <input type="checkbox" checked={v.addons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                            <span>{a.label}</span>
                          </label>
                        ))}
                      </fieldset>
                    )}
                    {OFFERS.length > 0 && (
                      <Field id="promo_code" label="Offer code" error={errors.promo_code}>
                        <input id="promo_code" name="promo_code" placeholder=" " value={v.promo_code} onChange={set('promo_code')} maxLength={30} />
                        {v.promo_code && <div className={`hint ${offer ? 'ok' : ''}`}>{offer ? `${offer.title}: noted for our team` : 'We will check this code'}</div>}
                      </Field>
                    )}
                  </div>
                </details>
              )}

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
                <label className="check" style={{ marginTop: 10 }}>
                  <input type="checkbox" name="newsletter" checked={v.newsletter} onChange={set('newsletter')} />
                  <span>Email me occasional offers. You can unsubscribe at any time. (optional)</span>
                </label>
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
