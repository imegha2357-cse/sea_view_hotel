import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import SmartImg from '../components/SmartImg';
import { EASE } from '../components/Motion';
import { authMessage, useAuth } from '../lib/auth';
import { firebaseReady, NOT_CONFIGURED } from '../lib/firebase';

function AuthField({ id, label, type = 'text', value, onChange, autoComplete, required = true }) {
  return (
    <div className="field">
      <input id={id} name={id} type={type} placeholder=" " value={value} onChange={onChange} autoComplete={autoComplete} required={required} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default function Login() {
  const { login, register, resetPassword, user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mode, setMode] = useState('signin');
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    document.title = 'Guest sign in | Hotel Sea View';
  }, []);
  useEffect(() => {
    if (!loading && user) nav(isAdmin ? '/admin' : loc.state?.from || '/account', { replace: true });
  }, [user, isAdmin, loading]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (mode === 'signup') {
      if (!f.name.trim()) return setError('Enter your name.');
      if (f.phone.replace(/\D/g, '').length < 10) return setError('Enter a 10-digit phone number.');
      if (f.password.length < 8) return setError('Use a password of at least 8 characters.');
    }
    setBusy(true);
    try {
      if (mode === 'signin') await login(f.email, f.password);
      else if (mode === 'signup') await register(f);
      else {
        await resetPassword(f.email);
        setInfo('If an account uses that email, a reset link is on its way.');
      }
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main id="main" className="auth-page">
      <div className="auth-media">
        <SmartImg name="roomDeluxe" eager />
        <motion.div className="quote" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}>
          <span className="eyebrow" style={{ color: '#f1d9b3' }}>
            Guest account
          </span>
          <h2>Track your enquiries and plan your stay by the sea.</h2>
        </motion.div>
      </div>
      <div className="auth-form">
        <motion.div className="inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Link to="/" className="link-arrow" style={{ justifySelf: 'start' }}>
            ← Back to hotel
          </Link>
          <div style={{ display: 'grid', gap: 8 }}>
            <h1>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h1>
            <p className="sub">{mode === 'reset' ? 'Enter your email and we will send a reset link.' : 'Sign in to see the status of your enquiries.'}</p>
          </div>
          {mode !== 'reset' && (
            <LayoutGroup id="auth-switch">
              <div className="auth-switch" role="tablist">
                {[
                  ['signin', 'Sign in'],
                  ['signup', 'Create account'],
                ].map(([m, l]) => (
                  <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); setError(''); }}>
                    {mode === m && <motion.span className="pill" layoutId="auth-pill" transition={{ duration: 0.3, ease: EASE }} />}
                    {l}
                  </button>
                ))}
              </div>
            </LayoutGroup>
          )}
          {!firebaseReady && <div className="info-box">{NOT_CONFIGURED} (Developer: add Firebase keys to .env.)</div>}
          <form onSubmit={submit} noValidate>
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div key="extra" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ display: 'grid', gap: 14, overflow: 'hidden' }}>
                  <AuthField id="name" label="Full name" value={f.name} onChange={set('name')} autoComplete="name" />
                  <AuthField id="phone" label="Phone / WhatsApp" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />
                </motion.div>
              )}
            </AnimatePresence>
            <AuthField id="email" label="Email" type="email" value={f.email} onChange={set('email')} autoComplete="email" />
            {mode !== 'reset' && <AuthField id="password" label="Password" type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />}
            {error && (
              <motion.div className="form-alert" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.div>
            )}
            {info && <div className="info-box" role="status">{info}</div>}
            <button className="btn solid" type="submit" disabled={busy}>
              {busy ? <span className="spin" aria-hidden="true" /> : null}
              {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
            </button>
          </form>
          <div className="auth-foot">
            {mode === 'reset' ? (
              <button className="text-btn" onClick={() => setMode('signin')}>
                Back to sign in
              </button>
            ) : (
              <button className="text-btn" onClick={() => setMode('reset')}>
                Forgot password?
              </button>
            )}
            <Link to="/admin/login">Staff sign in</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
