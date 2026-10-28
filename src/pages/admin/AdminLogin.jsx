import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SmartImg from '../../components/SmartImg';
import { EASE } from '../../components/Motion';
import { authMessage, useAuth } from '../../lib/auth';
import { firebaseReady, NOT_CONFIGURED } from '../../lib/firebase';
import { usePageMeta } from '../../lib/seo';

// Staff-only sign-in. There is no sign-up here: admin accounts are created with `npm run create-users`.
export default function AdminLogin() {
  const { login, logout, user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  usePageMeta('Staff sign in | Hotel Sea View', 'Staff access to the Hotel Sea View enquiry desk.', { noindex: true });
  useEffect(() => {
    if (!loading && user && isAdmin) nav('/admin', { replace: true });
  }, [user, isAdmin, loading]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const role = await login(email, password);
      if (role !== 'admin') {
        await logout();
        setError('This account does not have staff access. Guests can sign in from the guest page.');
      } else nav('/admin', { replace: true });
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main id="main" className="auth-page admin-theme">
      <div className="auth-media">
        <SmartImg name="front" eager />
        <div className="quote">
          <h2>Enquiry desk</h2>
          <p style={{ color: 'rgba(255,255,255,.85)' }}>Review new enquiries, update their status and follow up with guests.</p>
        </div>
      </div>
      <div className="auth-form">
        <motion.div className="inner" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <span className="badge-admin">Staff only</span>
          <div style={{ display: 'grid', gap: 8 }}>
            <h1>Admin sign in</h1>
            <p className="sub">Use the staff account created for Hotel Sea View.</p>
          </div>
          {!firebaseReady && <div className="info-box">{NOT_CONFIGURED} (Developer: add Firebase keys to .env.)</div>}
          <form onSubmit={submit} noValidate>
            <div className="field">
              <input id="a-email" type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              <label htmlFor="a-email">Staff email</label>
            </div>
            <div className="field">
              <input id="a-pass" type="password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              <label htmlFor="a-pass">Password</label>
            </div>
            {error && (
              <motion.div className="form-alert" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                {error}
              </motion.div>
            )}
            <button className="btn solid gold" type="submit" disabled={busy}>
              {busy && <span className="spin" aria-hidden="true" />}
              Sign in to dashboard
            </button>
          </form>
          <div className="auth-foot">
            <Link to="/">← Back to website</Link>
            <Link to="/login">Guest sign in</Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
