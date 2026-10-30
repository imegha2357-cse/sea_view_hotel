'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { AnimatePresence, motion } from 'framer-motion';
import { fb } from '../../lib/firebase';
import { useAuth, useIdleSignOut } from '../../lib/auth';
import { formatDate, nightsLabel, whatsappUrl } from '../../lib/enquiry';
import { downloadText, stayIcs, toISODate } from '../../lib/ics';
import { GOOGLE_REVIEW_URL, HOTEL } from '../../data/content';
import { useSiteData } from '@/components/SiteData';
import EnquiryForm from '../../components/EnquiryForm';
import Brand from '@/components/site/Brand';
import { EASE } from '../../components/Motion';

const GUEST_STEPS = ['New', 'Contacted', 'Availability Checked', 'Confirmed'];
const STEP_LABEL = {
  New: 'Enquiry received',
  Contacted: 'Our team contacted you',
  'Availability Checked': 'Availability checked',
  Confirmed: 'Stay confirmed',
};
const TYPE_LABEL = { stay: 'Room stay', event: 'Event', meeting: 'Meeting' };

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

// Feature #36: messages between the guest and the hotel on one enquiry.
function Messages({ enquiryId, author }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    const { db, F } = fb();
    const q = F.query(F.collection(db, 'booking_enquiries', enquiryId, 'messages'), F.orderBy('created_at', 'asc'));
    return F.onSnapshot(q, (s) => setList(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setErr('Messages could not be loaded.'));
  }, [enquiryId]);
  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setErr('');
    try {
      const { db, F } = fb();
      await F.addDoc(F.collection(db, 'booking_enquiries', enquiryId, 'messages'), { text: t.slice(0, 1000), from: 'guest', author: (author || '').slice(0, 80), created_at: F.serverTimestamp() });
      setText('');
    } catch {
      setErr('Not sent. Try again, or WhatsApp us.');
    }
  };
  return (
    <div className="thread">
      {list.length === 0 && <p className="meta">No messages yet. Ask a question here and our team will reply.</p>}
      {list.map((m) => (
        <div key={m.id} className={`bubble ${m.from}`}>
          <span>{m.text}</span>
          <small>
            {m.from === 'staff' ? 'Hotel Sea View' : 'You'} · {formatDate(m.created_at)}
          </small>
        </div>
      ))}
      <form onSubmit={send} className="thread-form">
        <label className="sr-only" htmlFor={`msg-${enquiryId}`}>
          Message to the hotel
        </label>
        <input id={`msg-${enquiryId}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a message" />
        <button className="btn outline" type="submit" disabled={!text.trim()}>
          Send
        </button>
      </form>
      {err && <p className="form-alert">{err}</p>}
    </div>
  );
}

// Feature #37: online check-in, so arrival is faster.
function CheckIn({ it }) {
  const [v, setV] = useState({ arrival_time: '', guest_names: '', vehicle: '', notes: '', ...(it.checkin || {}) });
  const [msg, setMsg] = useState('');
  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const { db, F } = fb();
      const checkin = {
        arrival_time: String(v.arrival_time).slice(0, 20),
        guest_names: String(v.guest_names).slice(0, 300),
        vehicle: String(v.vehicle).slice(0, 40),
        notes: String(v.notes).slice(0, 500),
        submitted_at: F.Timestamp.now(),
      };
      await F.updateDoc(F.doc(db, 'booking_enquiries', it.id), { checkin, updated_at: F.serverTimestamp() });
      setMsg('Saved. The front desk will have this ready.');
    } catch {
      setMsg('Not saved. Try again.');
    }
  };
  const f = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <form className="checkin-form" onSubmit={save}>
      <div className="field static">
        <input id={`at-${it.id}`} type="time" value={v.arrival_time} onChange={f('arrival_time')} />
        <label htmlFor={`at-${it.id}`}>Expected arrival time</label>
      </div>
      <div className="field">
        <input id={`gn-${it.id}`} placeholder=" " value={v.guest_names} onChange={f('guest_names')} maxLength={300} />
        <label htmlFor={`gn-${it.id}`}>Names of all adult guests</label>
      </div>
      <div className="field">
        <input id={`vh-${it.id}`} placeholder=" " value={v.vehicle} onChange={f('vehicle')} maxLength={40} />
        <label htmlFor={`vh-${it.id}`}>Vehicle number (for parking, optional)</label>
      </div>
      <div className="field">
        <input id={`nt-${it.id}`} placeholder=" " value={v.notes} onChange={f('notes')} maxLength={500} />
        <label htmlFor={`nt-${it.id}`}>Anything else for the front desk</label>
      </div>
      <p className="form-note">Please bring a government photo ID for each adult. We do not collect ID numbers online.</p>
      <div className="form-actions">
        <button className="btn solid" type="submit">
          Save check-in details
        </button>
        {msg && <span className="saved">{msg}</span>}
      </div>
    </form>
  );
}

function EnquiryCard({ it, i, author, onRebook }) {
  const [tab, setTab] = useState(null);
  const confirmed = it.status === 'Confirmed';
  const past = it.check_out?.toDate && it.check_out.toDate() < new Date();
  const stay = { check_in: toISODate(it.check_in), check_out: toISODate(it.check_out), room_type: it.room_type, guest_name: it.guest_name };
  return (
    <motion.article className="enq" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}>
      <div>
        <h3>{it.room_type || TYPE_LABEL[it.enquiry_type] || 'Any room'}</h3>
        <p className="meta">
          {it.check_in ? `${formatDate(it.check_in)} to ${formatDate(it.check_out)} · ${nightsLabel(it.check_in, it.check_out)}` : 'Dates not given'} ·{' '}
          {it.enquiry_type && it.enquiry_type !== 'stay' ? `${it.event_guests || '?'} guests` : `${it.adults} adults${it.children ? `, ${it.children} children` : ''}`}
        </p>
        <p className="meta">Sent {formatDate(it.created_at)}</p>
      </div>
      <span className={`pill st-${it.status.replace(/ /g, '-')}`}>{it.status}</span>
      <div className="tl">
        <Timeline status={it.status} />
      </div>
      <div className="enq-actions">
        <button className="text-btn" onClick={() => setTab(tab === 'msg' ? null : 'msg')} aria-expanded={tab === 'msg'}>
          Messages
        </button>
        {confirmed && !past && (
          <button className="text-btn" onClick={() => setTab(tab === 'checkin' ? null : 'checkin')} aria-expanded={tab === 'checkin'}>
            {it.checkin ? 'Edit online check-in' : 'Online check-in'}
          </button>
        )}
        {!past && it.check_in && it.status !== 'Cancelled' && (
          <button className="text-btn" onClick={() => downloadText('hotel-sea-view-stay.ics', stayIcs(stay))}>
            Add to calendar
          </button>
        )}
        <button className="text-btn" onClick={() => onRebook(it)}>
          Book again
        </button>
        {past && confirmed && GOOGLE_REVIEW_URL && (
          <a className="text-btn" href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">
            Review your stay
          </a>
        )}
      </div>
      <AnimatePresence initial={false}>
        {tab && (
          <motion.div className="enq-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            {tab === 'msg' ? <Messages enquiryId={it.id} author={author} /> : <CheckIn it={it} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function Account() {
  const { rooms } = useSiteData();
  const { user, profile, logout, saveProfile } = useAuth();
  const idleWarn = useIdleSignOut(30);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [p, setP] = useState({ name: '', phone: '' });
  const [prefs, setPrefs] = useState({ floor: '', bed: '', diet: '', notes: '' });
  const [savedRooms, setSavedRooms] = useState([]);
  const [occ, setOcc] = useState({ birthday: '', anniversary: '', occasion_offers: false });
  const [loyalty, setLoyalty] = useState(null);
  const [copied, setCopied] = useState(false);
  const { settings } = useSiteData();
  const [saved, setSaved] = useState('');
  const [privacyMsg, setPrivacyMsg] = useState('');


  useEffect(() => {
    setP({ name: profile?.name || user?.displayName || '', phone: profile?.phone || '' });
    setPrefs({ floor: '', bed: '', diet: '', notes: '', ...(profile?.preferences || {}) });
    setSavedRooms((profile?.saved_rooms || []).filter((id) => rooms.some((r) => r.id === id)));
    setOcc({ birthday: profile?.birthday || '', anniversary: profile?.anniversary || '', occasion_offers: Boolean(profile?.occasion_offers) });
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    const { db, F } = fb();
    F.getDoc(F.doc(db, 'loyalty', user.uid))
      .then((s) => setLoyalty(s.exists() ? s.data() : { points: 0, history: [] }))
      .catch(() => setLoyalty(null));
  }, [user]);
  const refLink = user ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${user.uid.slice(0, 8).toUpperCase()}` : '';
  const removeSaved = async (href) => {
    await saveProfile({ ...p, saved_items: (profile?.saved_items || []).filter((x) => x.href !== href) }).catch(() => {});
  };

  useEffect(() => {
    if (!user) return undefined;
    const { db, F } = fb();
    // Filter only on userId (no composite index needed) and sort newest first here.
    const q = F.query(F.collection(db, 'booking_enquiries'), F.where('userId', '==', user.uid));
    return F.onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0))),
      () => setError('We could not load your enquiries. Refresh the page to try again, or call us.')
    );
  }, [user]);

  const upcoming = useMemo(() => (items || []).find((it) => it.status === 'Confirmed' && it.check_in?.toDate && it.check_in.toDate() > new Date()), [items]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaved('');
    try {
      await saveProfile({ ...p, ...occ, preferences: prefs, saved_rooms: savedRooms.filter((id) => rooms.some((r) => r.id === id)) });
      setSaved('Saved');
    } catch {
      setSaved('Could not save. Try again.');
    }
  };

  const toggleRoom = (id) => setSavedRooms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(0, 10)));

  const rebook = (it) => {
    setPrefill({
      enquiry_type: it.enquiry_type || 'stay',
      room_type: it.room_type || '',
      adults: it.adults || 2,
      children: it.children || 0,
      check_in: '',
      check_out: '',
      message: prefs.notes ? `Preferences: ${prefs.notes}` : '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Feature #39: download my data, and delete my data (PRD privacy).
  const downloadData = () => {
    const strip = (o) => JSON.parse(JSON.stringify(o, (k, val) => (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val ? new Date(val.seconds * 1000).toISOString() : val)));
    const data = { exported_at: new Date().toISOString(), account: { email: user.email, ...strip(profile || {}) }, enquiries: strip(items || []) };
    downloadText('hotel-sea-view-my-data.json', JSON.stringify(data, null, 2), 'application/json');
  };
  const deleteData = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete your account and all your enquiries? This cannot be undone.')) return;
    setPrivacyMsg('Deleting…');
    try {
      const { db, F, A, auth } = fb();
      for (const it of items || []) await F.deleteDoc(F.doc(db, 'booking_enquiries', it.id));
      await F.deleteDoc(F.doc(db, 'users', user.uid));
      await A.deleteUser(auth.currentUser);
      setPrivacyMsg('Your data has been deleted.');
    } catch (err) {
      setPrivacyMsg(err?.code === 'auth/requires-recent-login' ? 'Your enquiries were deleted. To remove the login too, sign out, sign in again and repeat.' : 'Something went wrong. Please try again or email us.');
    }
  };

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="container">
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Hotel Sea View home">
            <Brand />
          </Link>
          <nav aria-label="Account">
            <span className="who">{user?.email}</span>
            <Link to="/">Website</Link>
            <button className="text-btn" onClick={logout}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      {idleWarn && (
        <div className="idle-bar" role="alert">
          You will be signed out in one minute because of inactivity. Move the mouse or press a key to stay signed in.
        </div>
      )}
      <main id="main" className="container dash-body">
        <div className="dash-head">
          <div>
            <h1>{p.name ? `Hello, ${p.name.split(' ')[0]}` : 'Welcome back'}</h1>
            <p>Your enquiries and their status. Our team updates these as they follow up with you.</p>
          </div>
          <button className="btn solid" onClick={() => { setPrefill(null); setShowForm((s) => !s); }}>
            {showForm ? 'Close form' : 'New enquiry'}
          </button>
        </div>

        {upcoming && (
          <div className="info-box upcoming">
            <b>Your next stay:</b> {formatDate(upcoming.check_in)} to {formatDate(upcoming.check_out)}
            {upcoming.room_type ? `, ${upcoming.room_type}` : ''}. {upcoming.checkin ? 'Online check-in done.' : 'Complete online check-in below to save time at the desk.'}
          </div>
        )}

        <AnimatePresence initial={false}>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} style={{ overflow: 'hidden' }}>
              <EnquiryForm prefill={prefill} />
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
                <EnquiryCard key={it.id} it={it} i={i} author={p.name} onRebook={rebook} />
              ))}
            </div>
          </section>

          <aside style={{ display: 'grid', gap: 24 }}>
            <section className="panel" aria-labelledby="my-details">
              <h2 id="my-details">My details and preferences</h2>
              <form className="profile-form" onSubmit={onSave}>
                <div className="field">
                  <input id="p-name" placeholder=" " autoComplete="name" value={p.name} onChange={(e) => setP((s) => ({ ...s, name: e.target.value }))} maxLength={80} />
                  <label htmlFor="p-name">Full name</label>
                </div>
                <div className="field">
                  <input id="p-phone" type="tel" autoComplete="tel" placeholder=" " value={p.phone} onChange={(e) => setP((s) => ({ ...s, phone: e.target.value }))} maxLength={20} />
                  <label htmlFor="p-phone">Phone / WhatsApp</label>
                </div>
                <div className="field static">
                  <select id="p-floor" value={prefs.floor} onChange={(e) => setPrefs((s) => ({ ...s, floor: e.target.value }))}>
                    <option value="">No preference</option>
                    <option>Lower floor</option>
                    <option>Higher floor</option>
                    <option>Near the lift</option>
                  </select>
                  <label htmlFor="p-floor">Floor</label>
                </div>
                <div className="field static">
                  <select id="p-bed" value={prefs.bed} onChange={(e) => setPrefs((s) => ({ ...s, bed: e.target.value }))}>
                    <option value="">No preference</option>
                    <option>King bed</option>
                    <option>Twin beds</option>
                  </select>
                  <label htmlFor="p-bed">Bed</label>
                </div>
                <div className="field static">
                  <select id="p-diet" value={prefs.diet} onChange={(e) => setPrefs((s) => ({ ...s, diet: e.target.value }))}>
                    <option value="">No preference</option>
                    <option>Vegetarian</option>
                    <option>Jain</option>
                    <option>Non-vegetarian</option>
                  </select>
                  <label htmlFor="p-diet">Food</label>
                </div>
                <div className="field">
                  <input id="p-notes" placeholder=" " value={prefs.notes} onChange={(e) => setPrefs((s) => ({ ...s, notes: e.target.value.slice(0, 300) }))} />
                  <label htmlFor="p-notes">Other requests we should remember</label>
                </div>
                <div className="field static">
                  <input id="p-bday" type="date" value={occ.birthday} onChange={(e) => setOcc((s) => ({ ...s, birthday: e.target.value }))} />
                  <label htmlFor="p-bday">Birthday (optional)</label>
                </div>
                <div className="field static">
                  <input id="p-anniv" type="date" value={occ.anniversary} onChange={(e) => setOcc((s) => ({ ...s, anniversary: e.target.value }))} />
                  <label htmlFor="p-anniv">Anniversary (optional)</label>
                </div>
                <label className="check">
                  <input type="checkbox" checked={occ.occasion_offers} onChange={(e) => setOcc((s) => ({ ...s, occasion_offers: e.target.checked }))} />
                  <span>Send me an offer for my birthday or anniversary</span>
                </label>
                <fieldset className="addons">
                  <legend>Saved rooms</legend>
                  {rooms.map((r) => (
                    <label key={r.id} className="check">
                      <input type="checkbox" checked={savedRooms.includes(r.id)} onChange={() => toggleRoom(r.id)} />
                      <span>
                        <Link to={`/rooms/${r.id}`}>{r.name}</Link>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="form-actions">
                  <button className="btn outline" type="submit">
                    Save details
                  </button>
                  {saved && <span className="saved">{saved}</span>}
                </div>
              </form>
            </section>
            {settings?.loyalty_rules && loyalty && (
              <section className="panel loyalty" aria-labelledby="my-points">
                <h2 id="my-points">My points</h2>
                <p className="points">
                  <b>{loyalty.points || 0}</b> points
                </p>
                <p className="meta" style={{ whiteSpace: 'pre-line' }}>
                  {settings.loyalty_rules}
                </p>
                {loyalty.history?.length > 0 && (
                  <ul className="points-hist">
                    {loyalty.history.slice(0, 6).map((h) => (
                      <li key={h.at}>
                        {h.pts > 0 ? '+' : ''}
                        {h.pts} · {h.note || 'Points'} · {new Date(h.at).toLocaleDateString('en-IN')}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            {profile?.saved_items?.length > 0 && (
              <section className="panel" aria-labelledby="my-saved">
                <h2 id="my-saved">Saved for later</h2>
                <ul className="saved-list">
                  {profile.saved_items.map((x) => (
                    <li key={x.href}>
                      <Link to={x.href}>{x.title}</Link>
                      <button type="button" className="text-btn muted" onClick={() => removeSaved(x.href)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="panel" aria-labelledby="refer">
              <h2 id="refer">Invite a friend</h2>
              <p className="meta">Share your link. When a friend sends an enquiry through it, our team sees that you referred them.</p>
              <div className="cm-inline">
                <input className="cm-input" readOnly value={refLink} aria-label="Your invite link" onFocus={(e) => e.target.select()} />
                <button
                  type="button"
                  className="btn outline sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(refLink);
                    setCopied(true);
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </section>
            <section className="panel" aria-labelledby="help">
              <h2 id="help">Need help?</h2>
              <p className="meta" style={{ marginBottom: 12 }}>
                Call {HOTEL.phone} or message us on WhatsApp.
              </p>
              <a className="btn solid wa" href={whatsappUrl({ guest_name: p.name })} target="_blank" rel="noreferrer">
                WhatsApp the hotel
              </a>
            </section>
            <section className="panel" aria-labelledby="my-data">
              <h2 id="my-data">Your data</h2>
              <p className="meta" style={{ marginBottom: 12 }}>
                Download a copy of everything we hold about you, or delete it. See the <Link to="/privacy">privacy notice</Link>.
              </p>
              <div className="form-actions">
                <button className="btn outline" onClick={downloadData} disabled={!items}>
                  Download my data
                </button>
                <button className="text-btn danger" onClick={deleteData} disabled={!items}>
                  Delete my account
                </button>
              </div>
              {privacyMsg && <p className="meta" role="status">{privacyMsg}</p>}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
