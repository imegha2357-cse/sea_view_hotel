import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { formatDate, nights, nightsLabel } from '../../lib/enquiry';
import { ENQUIRY_STATUSES, HOTEL } from '../../data/content';
import { Brand } from '../../components/Header';
import { EASE } from '../../components/Motion';
import { addDemoEnquiries, removeDemoEnquiries } from '../../lib/demo';

const pillClass = (s) => `pill st-${s.replace(/ /g, '-')}`;
const toISO = (ts) => (ts?.toDate ? ts.toDate().toISOString().slice(0, 10) : '');

function exportCsv(rows) {
  const cols = ['created', 'status', 'guest_name', 'phone', 'email', 'check_in', 'check_out', 'nights', 'adults', 'children', 'room_type', 'message', 'source', 'id'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [toISO(r.created_at), r.status, r.guest_name, r.phone, r.email, toISO(r.check_in), toISO(r.check_out), nights(r.check_in, r.check_out), r.adults, r.children, r.room_type, r.message, r.source, r.id].map(esc).join(',')
  );
  const blob = new Blob([[cols.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `seaview-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selId, setSelId] = useState(null);

  useEffect(() => {
    document.title = 'Enquiries | Hotel Sea View admin';
    const q = query(collection(db, 'booking_enquiries'), orderBy('created_at', 'desc'), limit(500));
    return onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setError('Could not load enquiries. Check that this account is listed in the admins collection.')
    );
  }, []);

  const counts = useMemo(() => {
    const c = { All: rows?.length || 0 };
    ENQUIRY_STATUSES.forEach((s) => (c[s] = 0));
    rows?.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (rows || []).filter(
      (r) => (status === 'All' || r.status === status) && (!s || [r.guest_name, r.phone, r.email, r.room_type].some((v) => String(v || '').toLowerCase().includes(s)))
    );
  }, [rows, status, search]);

  const sel = rows?.find((r) => r.id === selId) || null;
  const demoCount = rows?.filter((r) => r.source === 'demo').length || 0;
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoMsg, setDemoMsg] = useState('');
  const runDemo = async (fn, ok) => {
    setDemoBusy(true);
    setDemoMsg('');
    try {
      const n = await fn();
      setDemoMsg(ok(n));
    } catch (err) {
      setDemoMsg(
        err?.code === 'permission-denied'
          ? 'Firebase refused this. Publish the updated firestore.rules from the GitHub repo (Firestore → Rules → Publish), then try again.'
          : 'Something went wrong. Check your connection and try again.'
      );
    } finally {
      setDemoBusy(false);
    }
  };
  const stats = [
    ['All', 'All enquiries'],
    ['New', 'New'],
    ['Awaiting Guest', 'Awaiting guest'],
    ['Confirmed', 'Confirmed'],
  ];

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="container">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Brand />
          </Link>
          <nav>
            <span className="who">Staff · {user?.email}</span>
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
            <h1>Enquiries</h1>
            <p>New website enquiries appear here instantly. Update the status as you follow up.</p>
          </div>
          <div className="head-actions">
            {demoCount ? (
              <button className="btn outline" disabled={demoBusy} onClick={() => runDemo(removeDemoEnquiries, (n) => `Removed ${n} demo enquiries.`)}>
                {demoBusy && <span className="spin dark" aria-hidden="true" />}
                Remove {demoCount} demo enquiries
              </button>
            ) : (
              <button className="btn outline" disabled={demoBusy || !rows} onClick={() => runDemo(addDemoEnquiries, (n) => `Added ${n} demo enquiries, marked Demo.`)}>
                {demoBusy && <span className="spin dark" aria-hidden="true" />}
                Add 15 demo enquiries
              </button>
            )}
            <button className="btn outline" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              Export CSV
            </button>
          </div>
        </div>

        {demoMsg && (
          <div className={demoMsg.startsWith('Firebase') || demoMsg.startsWith('Something') ? 'form-alert' : 'info-box'} role="status">
            {demoMsg}
          </div>
        )}

        <div className="stats">
          {stats.map(([key, label], i) => (
            <motion.button key={key} className={`stat ${status === key ? 'on' : ''}`} onClick={() => setStatus(key)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}>
              <span>{label}</span>
              <b>{rows ? counts[key] : '–'}</b>
            </motion.button>
          ))}
        </div>

        <section className="panel">
          <div className="toolbar" style={{ marginBottom: 14 }}>
            <input type="search" placeholder="Search name, phone, email or room" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search enquiries" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option>All</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s} ({counts[s] || 0})
                </option>
              ))}
            </select>
          </div>
          {error && <div className="form-alert">{error}</div>}
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Guest</th>
                  <th>Stay</th>
                  <th>Guests</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={selId === r.id ? 'sel' : ''} onClick={() => setSelId(r.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelId(r.id)}>
                    <td className="num">{formatDate(r.created_at)}</td>
                    <td>
                      {r.guest_name}
                      {r.source === 'demo' && <span className="demo-tag">Demo</span>}
                      <span className="sub">{r.phone}</span>
                    </td>
                    <td className="num">
                      {formatDate(r.check_in)} → {formatDate(r.check_out)}
                      <span className="sub">{nightsLabel(r.check_in, r.check_out)}</span>
                    </td>
                    <td className="num">
                      {r.adults}A{r.children ? ` · ${r.children}C` : ''}
                    </td>
                    <td>{r.room_type || 'Any'}</td>
                    <td>
                      <span className={pillClass(r.status)}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows && !filtered.length && (
              <div className="empty">
                <p>{rows.length ? 'No enquiries match these filters.' : 'No enquiries yet. New ones from the website will appear here.'}</p>
              </div>
            )}
            {!rows && !error && <div className="empty">Loading…</div>}
          </div>
        </section>
      </main>

      <AnimatePresence>{sel && <Drawer key={sel.id} r={sel} onClose={() => setSelId(null)} />}</AnimatePresence>
    </div>
  );
}

function Drawer({ r, onClose }) {
  const [status, setStatus] = useState(r.status);
  const [notes, setNotes] = useState(r.staff_notes || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await updateDoc(doc(db, 'booking_enquiries', r.id), { status, staff_notes: notes.slice(0, 2000), updated_at: serverTimestamp() });
      setMsg('Saved');
    } catch {
      setMsg('Not saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const digits = String(r.phone || '').replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const reply = encodeURIComponent(`Hello ${r.guest_name}, thank you for your enquiry with ${HOTEL.name} for ${formatDate(r.check_in)} to ${formatDate(r.check_out)}. `);

  return (
    <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label={`Enquiry from ${r.guest_name}`}>
      <motion.div className="drawer-bg" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: EASE }}>
        <button className="x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div>
          <span className={pillClass(r.status)}>{r.status}</span>
          <h2 style={{ marginTop: 10 }}>{r.guest_name}</h2>
        </div>
        <div className="quick">
          <a className="btn solid" href={`tel:${r.phone}`}>
            Call
          </a>
          <a className="btn solid wa" href={`https://wa.me/${wa}?text=${reply}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {r.email && (
            <a className="btn outline" href={`mailto:${r.email}?subject=${encodeURIComponent('Your enquiry with Hotel Sea View')}`}>
              Email
            </a>
          )}
        </div>
        <dl>
          <dt>Phone</dt>
          <dd>{r.phone}</dd>
          <dt>Email</dt>
          <dd>{r.email || '–'}</dd>
          <dt>Check-in</dt>
          <dd>{formatDate(r.check_in)}</dd>
          <dt>Check-out</dt>
          <dd>
            {formatDate(r.check_out)} ({nightsLabel(r.check_in, r.check_out)})
          </dd>
          <dt>Guests</dt>
          <dd>
            {r.adults} adults, {r.children || 0} children
          </dd>
          <dt>Room</dt>
          <dd>{r.room_type || 'No preference'}</dd>
          <dt>Source</dt>
          <dd>{r.source}</dd>
          <dt>Account</dt>
          <dd>{r.userId ? 'Signed-in guest' : 'Not signed in'}</dd>
          <dt>Received</dt>
          <dd>{r.created_at?.toDate ? r.created_at.toDate().toLocaleString('en-IN') : ''}</dd>
        </dl>
        {r.message && (
          <div>
            <span className="lbl" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
              Guest message
            </span>
            <div className="msg">{r.message}</div>
          </div>
        )}
        <div>
          <label className="lbl" htmlFor="d-status">
            Status
          </label>
          <select id="d-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="lbl" htmlFor="d-notes">
            Staff notes (not shown to the guest)
          </label>
          <textarea id="d-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Rate quoted, follow-up date, special requests…" />
        </div>
        <div className="form-actions">
          <button className="btn solid" onClick={save} disabled={saving}>
            {saving && <span className="spin" aria-hidden="true" />}
            Save changes
          </button>
          {msg && <span className={msg === 'Saved' ? 'saved' : ''}>{msg}</span>}
        </div>
      </motion.aside>
    </div>
  );
}
