'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { AnimatePresence, motion } from 'framer-motion';
import { fb } from '../../lib/firebase';
import { useAuth, useIdleSignOut } from '../../lib/auth';
import { formatDate, nights, nightsLabel } from '../../lib/enquiry';
import { toISODate } from '../../lib/ics';
import { sourceLabel } from '../../lib/attribution';
import { ENQUIRY_STATUSES } from '../../data/content';
import Brand from '@/components/site/Brand';
import { EASE } from '../../components/Motion';
import { removeDemoEnquiries } from '../../lib/demo';
import Drawer from './Drawer';
import Reports from './Reports';
import AvailabilityEditor from './AvailabilityEditor';
import Inbox from './Inbox';
import ManualEntry from './ManualEntry';
import ContentManager from './content/ContentManager';

const pillClass = (s) => `pill st-${s.replace(/ /g, '-')}`;
const OPEN = ['New', 'Contacted', 'Availability Checked', 'Awaiting Guest'];
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
export const isOverdue = (r) => OPEN.includes(r.status) && r.follow_up_at?.toDate && r.follow_up_at.toDate() < startOfToday();
export const isDueToday = (r) => {
  if (!OPEN.includes(r.status) || !r.follow_up_at?.toDate) return false;
  const t = r.follow_up_at.toDate();
  const s = startOfToday();
  return t >= s && t < new Date(s.getTime() + 86400000);
};
// Feature #45: an enquiry that sits in "New" for over a day is flagged.
const isStale = (r) => r.status === 'New' && r.created_at?.toDate && Date.now() - r.created_at.toDate().getTime() > 86400000;

function exportCsv(rows) {
  const cols = ['created', 'status', 'type', 'guest_name', 'phone', 'email', 'check_in', 'check_out', 'nights', 'adults', 'children', 'event_guests', 'room_type', 'pickup', 'addons', 'callback_time', 'promo_code', 'message', 'source', 'came_from', 'assigned_to', 'follow_up', 'id'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      toISODate(r.created_at), r.status, r.enquiry_type || 'stay', r.guest_name, r.phone, r.email, toISODate(r.check_in), toISODate(r.check_out),
      nights(r.check_in, r.check_out), r.adults, r.children, r.event_guests, r.room_type, r.pickup, (r.addons || []).join(' '), r.callback_time,
      r.promo_code, r.message, r.source, sourceLabel(r), r.assigned_to, toISODate(r.follow_up_at), r.id,
    ].map(esc).join(',')
  );
  const blob = new Blob([[cols.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `seaview-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const TABS = [
  ['enquiries', 'Enquiries'],
  ['availability', 'Availability'],
  ['reports', 'Reports'],
  ['inbox', 'Inbox'],
  ['content', 'Website'],
];

export default function AdminDashboard() {
  const { user, logout, staffRole, canEdit } = useAuth();
  const idleWarn = useIdleSignOut(30);
  const [tab, setTab] = useState('enquiries');
  const [rows, setRows] = useState(null);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All');
  const [view, setView] = useState('all'); // all | mine | follow | overdue
  const [search, setSearch] = useState('');
  const [selId, setSelId] = useState(null);
  const [showNew, setShowNew] = useState(false);


  useEffect(() => {
    const { db, F } = fb();
    const q = F.query(F.collection(db, 'booking_enquiries'), F.orderBy('created_at', 'desc'), F.limit(1000));
    const off = F.onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setError('Could not load enquiries. Check that this account is listed in the admins collection.')
    );
    F.getDocs(F.collection(db, 'admins'))
      .then((s) => setStaff(s.docs.map((d) => d.data().email || d.data().name || d.id)))
      .catch(() => {});
    return off;
  }, []);

  const me = user?.email || '';
  const staffList = useMemo(() => Array.from(new Set([me, ...staff].filter(Boolean))), [me, staff]);

  const counts = useMemo(() => {
    const c = { All: rows?.length || 0, overdue: 0, today: 0, stale: 0 };
    ENQUIRY_STATUSES.forEach((s) => (c[s] = 0));
    rows?.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
      if (isOverdue(r)) c.overdue++;
      if (isDueToday(r)) c.today++;
      if (isStale(r)) c.stale++;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (rows || []).filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (view === 'mine' && r.assigned_to !== me) return false;
      if (view === 'follow' && !isDueToday(r) && !isOverdue(r)) return false;
      if (view === 'overdue' && !isOverdue(r)) return false;
      return !s || [r.guest_name, r.phone, r.email, r.room_type, r.promo_code].some((v) => String(v || '').toLowerCase().includes(s));
    });
  }, [rows, status, view, search, me]);

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

  // Feature #50: possible duplicates share a phone number with another open enquiry.
  const dupes = useMemo(() => {
    const byPhone = {};
    (rows || []).forEach((r) => {
      const k = String(r.phone || '').replace(/\D/g, '').slice(-10);
      if (k) (byPhone[k] ||= []).push(r.id);
    });
    return byPhone;
  }, [rows]);
  const dupCount = (r) => (dupes[String(r.phone || '').replace(/\D/g, '').slice(-10)] || []).length;

  const stats = [
    ['All', 'All enquiries', () => { setStatus('All'); setView('all'); }, status === 'All' && view === 'all', counts.All],
    ['New', 'New', () => { setStatus('New'); setView('all'); }, status === 'New', counts.New],
    ['follow', 'Follow up today', () => { setStatus('All'); setView('follow'); }, view === 'follow', counts.today + counts.overdue],
    ['overdue', 'Overdue', () => { setStatus('All'); setView('overdue'); }, view === 'overdue', counts.overdue],
  ];

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="container">
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Hotel Sea View home">
            <Brand />
          </Link>
          <nav aria-label="Staff">
            <span className="who">
              Staff · {me} · {staffRole === 'viewer' ? 'view only' : staffRole}
            </span>
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
            <h1>Front desk</h1>
            <p>New website enquiries appear here instantly. Update the status as you follow up.</p>
          </div>
          {tab === 'enquiries' && (
            <div className="head-actions">
              {canEdit && (
                <button className="btn solid" onClick={() => setShowNew(true)}>
                  Add phone or walk-in enquiry
                </button>
              )}
              {canEdit && demoCount > 0 && (
                <button className="btn outline" disabled={demoBusy} onClick={() => runDemo(removeDemoEnquiries, (n) => `Removed ${n} demo enquiries.`)}>
                  {demoBusy && <span className="spin dark" aria-hidden="true" />}
                  Remove {demoCount} demo enquiries
                </button>
              )}
              <button className="btn outline" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
                Export CSV
              </button>
            </div>
          )}
        </div>

        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label}
              {tab === id && <motion.span layoutId="tab-line" className="tab-line" transition={{ duration: 0.35, ease: EASE }} />}
            </button>
          ))}
        </div>

        {demoMsg && tab === 'enquiries' && (
          <div className={demoMsg.startsWith('Firebase') || demoMsg.startsWith('Something') ? 'form-alert' : 'info-box'} role="status">
            {demoMsg}
          </div>
        )}

        {tab === 'enquiries' && (
          <>
            {counts.stale > 0 && (
              <div className="info-box warn" role="status">
                {counts.stale} new {counts.stale === 1 ? 'enquiry has' : 'enquiries have'} waited more than a day for a reply.
              </div>
            )}
            <div className="stats">
              {stats.map(([key, label, onClick, on, n], i) => (
                <motion.button key={key} className={`stat ${on ? 'on' : ''} ${key === 'overdue' && n ? 'alert' : ''}`} onClick={onClick} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}>
                  <span>{label}</span>
                  <b>{rows ? n : '–'}</b>
                </motion.button>
              ))}
            </div>

            <section className="panel" aria-label="Enquiry list">
              <div className="toolbar" style={{ marginBottom: 14 }}>
                <input type="search" placeholder="Search name, phone, email, room or code" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search enquiries" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
                  <option>All</option>
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s} ({counts[s] || 0})
                    </option>
                  ))}
                </select>
                <select value={view} onChange={(e) => setView(e.target.value)} aria-label="Show">
                  <option value="all">Everyone's</option>
                  <option value="mine">Assigned to me</option>
                  <option value="follow">Follow up today</option>
                  <option value="overdue">Overdue</option>
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
                      <th>Follow up</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className={`${selId === r.id ? 'sel' : ''} ${isOverdue(r) ? 'overdue' : ''}`} onClick={() => setSelId(r.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelId(r.id)}>
                        <td className="num">
                          {formatDate(r.created_at)}
                          <span className="sub">{sourceLabel(r)}</span>
                        </td>
                        <td>
                          {r.guest_name}
                          {r.source === 'demo' && <span className="demo-tag">Demo</span>}
                          {dupCount(r) > 1 && (
                            <span className="demo-tag dup" title="Another enquiry uses this phone number">
                              Repeat
                            </span>
                          )}
                          <span className="sub">{r.phone}</span>
                        </td>
                        <td className="num">
                          {r.check_in ? `${formatDate(r.check_in)} → ${formatDate(r.check_out)}` : 'Dates not given'}
                          {r.check_in && <span className="sub">{nightsLabel(r.check_in, r.check_out)}</span>}
                        </td>
                        <td className="num">{r.enquiry_type && r.enquiry_type !== 'stay' ? `${r.event_guests || '?'} (${r.enquiry_type})` : `${r.adults}A${r.children ? ` · ${r.children}C` : ''}`}</td>
                        <td>{r.room_type || 'Any'}</td>
                        <td className="num">
                          {r.follow_up_at ? formatDate(r.follow_up_at) : '–'}
                          {r.assigned_to && <span className="sub">{r.assigned_to.split('@')[0]}</span>}
                        </td>
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
          </>
        )}

        {tab === 'availability' && <AvailabilityEditor canEdit={canEdit} me={me} />}
        {tab === 'reports' && <Reports rows={rows || []} />}
        {tab === 'inbox' && <Inbox canEdit={canEdit} />}
        {tab === 'content' && <ContentManager canEdit={canEdit} me={me} />}
      </main>

      <AnimatePresence>
        {sel && <Drawer key={sel.id} r={sel} me={me} staffList={staffList} canEdit={canEdit} repeat={dupCount(sel) > 1} onClose={() => setSelId(null)} />}
        {showNew && <ManualEntry key="new" me={me} onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  );
}
