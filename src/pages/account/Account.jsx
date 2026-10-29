import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { formatDate, nightsLabel, whatsappUrl } from '../../lib/enquiry';
import { ENQUIRY_STATUSES, HOTEL } from '../../data/content';
import EnquiryForm from '../../components/EnquiryForm';
import { Brand } from '../../components/Header';
import { EASE } from '../../components/Motion';

const GUEST_STEPS = ['New', 'Contacted', 'Availability Checked', 'Confirmed'];
const STEP_LABEL = {
  New: 'Enquiry received',
  Contacted: 'Our team contacted you',
  'Availability Checked': 'Availability checked',
  Confirmed: 'Stay confirmed',
};

function Timeline({ status }) {
  if (status === 'Cancelled' || status === 'Closed') return <p className="meta">This enquiry is {status.toLowerCase()}.</p>;
  const at = status === 'Awaiting Guest' ? 2 : GUEST_STEPS.indexOf(status);
  return (
    <ol className="timeline">
      {GUEST_STEPS.map((s, i) => (
        <li key={s} className={i < at ? 'done' : i === at ? 'now' : ''}>
          {STEP_LABEL[s]}
          {status === 'Awaiting Guest' && i === 2 ? ' · waiting for your reply' : ''}
        </li>
      ))}
    </ol>
  );
}

export default function Account() {
  const { user, profile, logout, saveProfile } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [p, setP] = useState({ name: '', phone: '' });
  const [saved, setSaved] = useState('');

  useEffect(() => {
    document.title = 'My account | Hotel Sea View';
  }, []);
  useEffect(() => {
    setP({ name: profile?.name || user?.displayName || '', phone: profile?.phone || '' });
  }, [profile, user]);

  useEffect(() => {
    if (!user) return undefined;
    const q = query(collection(db, 'booking_enquiries'), where('userId', '==', user.uid), orderBy('created_at', 'desc'));
    return onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => setError(err.code === 'failed-precondition' ? 'The enquiries index is still building. Try again in a few minutes.' : 'We could not load your enquiries. Refresh to try again.')
    );
  }, [user]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaved('');
    try {
      await saveProfile(p);
      setSaved('Saved');
    } catch {
      setSaved('Could not save. Try again.');
    }
  };

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="container">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Brand />
          </Link>
          <nav>
            <span className="who">{user?.email}</span>
            <Link to="/">Website</Link>
            <button className="text-btn" onClick={logout}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main id="main" className="container dash-body">
        <div className="dash-head">
          <div>
            <h1>Hello{p.name ? `, ${p.name.split(' ')[0]}` : ''}</h1>
            <p>Your enquiries and their status. Our team updates these as they follow up with you.</p>
          </div>
          <button className="btn solid" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Close form' : 'New enquiry'}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ overflow: 'hidden' }}>
              <EnquiryForm compact={false} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="acct-grid">
          <section className="panel" aria-labelledby="my-enq">
            <h2 id="my-enq">My enquiries</h2>
            {error && <div className="form-alert">{error}</div>}
            {items === null && !error && <p className="meta">Loading…</p>}
            {items?.length === 0 && (
              <div className="empty">
                <p>No enquiries yet.</p>
                <button className="btn outline" onClick={() => setShowForm(true)}>
                  Send your first enquiry
                </button>
              </div>
            )}
            <div className="enq-list">
              {items?.map((it, i) => (
                <motion.article key={it.id} className="enq" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}>
                  <div>
                    <h3>{it.room_type || 'Any room'}</h3>
                    <p className="meta">
                      {formatDate(it.check_in)} to {formatDate(it.check_out)} · {nightsLabel(it.check_in, it.check_out)} · {it.adults} adults
                      {it.children ? `, ${it.children} children` : ''}
                    </p>
                    <p className="meta">Sent {formatDate(it.created_at)}</p>
                  </div>
                  <span className={`pill st-${it.status.replace(/ /g, '-')}`}>{it.status}</span>
                  <div className="tl">
                    <Timeline status={it.status} />
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <aside style={{ display: 'grid', gap: 24 }}>
            <section className="panel">
              <h2>My details</h2>
              <form className="profile-form" onSubmit={onSave}>
                <div className="field">
                  <input id="p-name" placeholder=" " value={p.name} onChange={(e) => setP((s) => ({ ...s, name: e.target.value }))} />
                  <label htmlFor="p-name">Full name</label>
                </div>
                <div className="field">
                  <input id="p-phone" type="tel" placeholder=" " value={p.phone} onChange={(e) => setP((s) => ({ ...s, phone: e.target.value }))} />
                  <label htmlFor="p-phone">Phone / WhatsApp</label>
                </div>
                <div className="form-actions">
                  <button className="btn outline" type="submit">
                    Save details
                  </button>
                  {saved && <span className="saved">{saved}</span>}
                </div>
              </form>
            </section>
            <section className="panel">
              <h2>Need help?</h2>
              <p className="meta" style={{ marginBottom: 12 }}>
                Call {HOTEL.phone} or message us on WhatsApp.
              </p>
              <a className="btn solid wa" href={whatsappUrl({ guest_name: p.name })} target="_blank" rel="noreferrer">
                WhatsApp the hotel
              </a>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export { ENQUIRY_STATUSES };
