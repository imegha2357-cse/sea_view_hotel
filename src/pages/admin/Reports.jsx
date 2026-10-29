import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { nights } from '../../lib/enquiry';
import { sourceLabel } from '../../lib/attribution';
import { ENQUIRY_STATUSES } from '../../data/content';
import { EASE } from '../../components/Motion';

// Feature #51: simple numbers for the owner. Demo records can be left out.
function Bars({ title, data }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <section className="panel report">
      <h2>{title}</h2>
      {data.length === 0 && <p className="meta">No data yet.</p>}
      <ul className="bars">
        {data.map(([k, n], i) => (
          <li key={k}>
            <span className="bar-label">{k}</span>
            <span className="bar-track">
              <motion.span className="bar-fill" initial={{ width: 0 }} animate={{ width: `${(n / max) * 100}%` }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.04 }} />
            </span>
            <b>{n}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

const tally = (rows, key) => {
  const m = {};
  rows.forEach((r) => {
    const k = key(r);
    if (k) m[k] = (m[k] || 0) + 1;
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};

export default function Reports({ rows }) {
  const [demo, setDemo] = useState(false);
  const [range, setRange] = useState('90');
  const list = useMemo(() => {
    const since = range === 'all' ? 0 : Date.now() - +range * 86400000;
    return rows.filter((r) => (demo || r.source !== 'demo') && (!since || (r.created_at?.toDate && r.created_at.toDate().getTime() >= since)));
  }, [rows, demo, range]);

  const confirmed = list.filter((r) => r.status === 'Confirmed');
  const conv = list.length ? Math.round((confirmed.length / list.length) * 100) : 0;
  const roomNights = confirmed.reduce((s, r) => s + nights(r.check_in, r.check_out), 0);

  // Average hours from enquiry to first update, as a rough response time.
  const responded = list.filter((r) => r.status !== 'New' && r.created_at?.toDate && r.updated_at?.toDate && r.source === 'website_form');
  const avgHours = responded.length
    ? Math.round(responded.reduce((s, r) => s + (r.updated_at.toDate() - r.created_at.toDate()) / 3600000, 0) / responded.length)
    : null;

  const byMonth = useMemo(() => {
    const m = {};
    list.forEach((r) => {
      if (!r.check_in?.toDate) return;
      const d = r.check_in.toDate();
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m)
      .sort()
      .map(([k, n]) => [new Date(`${k}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), n]);
  }, [list]);

  return (
    <div className="reports">
      <div className="toolbar">
        <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Period">
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
          <option value="all">All time</option>
        </select>
        <label className="check">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
          <span>Include demo enquiries</span>
        </label>
      </div>
      <div className="stats">
        <div className="stat">
          <span>Enquiries</span>
          <b>{list.length}</b>
        </div>
        <div className="stat">
          <span>Confirmed</span>
          <b>{confirmed.length}</b>
        </div>
        <div className="stat">
          <span>Conversion</span>
          <b>{conv}%</b>
        </div>
        <div className="stat">
          <span>Room nights confirmed</span>
          <b>{roomNights}</b>
        </div>
      </div>
      {avgHours != null && <p className="meta">Average time to first update on website enquiries: about {avgHours} hours.</p>}
      <div className="report-grid">
        <Bars title="By status" data={ENQUIRY_STATUSES.map((s) => [s, list.filter((r) => r.status === s).length]).filter(([, n]) => n)} />
        <Bars title="By room" data={tally(list, (r) => r.room_type || (r.enquiry_type && r.enquiry_type !== 'stay' ? `${r.enquiry_type[0].toUpperCase()}${r.enquiry_type.slice(1)}` : 'No preference'))} />
        <Bars title="Where guests came from" data={tally(list, sourceLabel)} />
        <Bars title="By arrival month" data={byMonth} />
      </div>
    </div>
  );
}
