import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fb } from '../../lib/firebase';
import { formatDate, nightsLabel, PICKUPS, ADDONS } from '../../lib/enquiry';
import { toISODate } from '../../lib/ics';
import { sourceLabel } from '../../lib/attribution';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { ENQUIRY_STATUSES, HOTEL } from '../../data/content';
import { EASE } from '../../components/Motion';
import { templates, waNumber } from './templates';

const pillClass = (s) => `pill st-${s.replace(/ /g, '-')}`;
const label = (list, id) => list.find((x) => x.id === id)?.label || id;

function Thread({ id, me, canEdit }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  useEffect(() => {
    const { db, F } = fb();
    return F.onSnapshot(F.query(F.collection(db, 'booking_enquiries', id, 'messages'), F.orderBy('created_at', 'asc')), (s) => setList(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
  }, [id]);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { db, F } = fb();
    await F.addDoc(F.collection(db, 'booking_enquiries', id, 'messages'), { text: text.trim().slice(0, 1000), from: 'staff', author: me.slice(0, 80), created_at: F.serverTimestamp() });
    setText('');
  };
  return (
    <div className="thread">
      {list.length === 0 && <p className="meta">No messages in the guest's account yet.</p>}
      {list.map((m) => (
        <div key={m.id} className={`bubble ${m.from === 'staff' ? 'guest' : 'staff'}`}>
          <span>{m.text}</span>
          <small>
            {m.from === 'staff' ? m.author || 'Staff' : 'Guest'} · {formatDate(m.created_at)}
          </small>
        </div>
      ))}
      {canEdit && (
        <form onSubmit={send} className="thread-form">
          <label className="sr-only" htmlFor="staff-msg">
            Reply in the guest's account
          </label>
          <input id="staff-msg" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Reply (shows in the guest's account)" />
          <button className="btn outline" type="submit" disabled={!text.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}

function History({ id }) {
  const [list, setList] = useState(null);
  useEffect(() => {
    const { db, F } = fb();
    return F.onSnapshot(F.query(F.collection(db, 'booking_enquiries', id, 'history'), F.orderBy('at', 'desc'), F.limit(30)), (s) => setList(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setList([]));
  }, [id]);
  if (!list) return null;
  if (!list.length) return <p className="meta">No changes recorded yet.</p>;
  return (
    <ul className="history">
      {list.map((h) => (
        <li key={h.id}>
          <b>{h.change}</b>
          <small>
            {h.by} · {h.at?.toDate ? h.at.toDate().toLocaleString('en-IN') : ''}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default function Drawer({ r, onClose, me, staffList, canEdit, repeat }) {
  const [status, setStatus] = useState(r.status);
  const [notes, setNotes] = useState(r.staff_notes || '');
  const [assigned, setAssigned] = useState(r.assigned_to || '');
  const [follow, setFollow] = useState(toISODate(r.follow_up_at));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tpl, setTpl] = useState('thanks');
  const [section, setSection] = useState('details');
  const ref = useRef(null);

  useEffect(() => {
    lockScroll();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const { db, F } = fb();
      const patch = {
        status,
        staff_notes: notes.slice(0, 2000),
        assigned_to: assigned.slice(0, 120) || null,
        follow_up_at: follow ? F.Timestamp.fromDate(new Date(`${follow}T09:00:00`)) : null,
        updated_at: F.serverTimestamp(),
      };
      await F.updateDoc(F.doc(db, 'booking_enquiries', r.id), patch);
      // Feature #47: record what changed.
      const changes = [];
      if (status !== r.status) changes.push(`Status ${r.status} → ${status}`);
      if ((assigned || '') !== (r.assigned_to || '')) changes.push(`Assigned to ${assigned || 'nobody'}`);
      if (follow !== toISODate(r.follow_up_at)) changes.push(follow ? `Follow up on ${follow}` : 'Follow-up cleared');
      if (notes !== (r.staff_notes || '')) changes.push('Notes edited');
      if (changes.length)
        await F.addDoc(F.collection(db, 'booking_enquiries', r.id, 'history'), { change: changes.join('; ').slice(0, 300), by: me.slice(0, 120), at: F.serverTimestamp() });
      setMsg('Saved');
    } catch {
      setMsg('Not saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const tlist = templates(r);
  const chosen = tlist.find((t) => t.id === tpl) || tlist[0];
  const wa = waNumber(r.phone);
  const ci = r.checkin;

  return (
    <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label={`Enquiry from ${r.guest_name}`}>
      <motion.div className="drawer-bg" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="drawer" data-lenis-prevent initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: EASE }} tabIndex={-1} ref={ref}>
        <button className="x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div>
          <span className={pillClass(r.status)}>{r.status}</span>
          {r.source === 'demo' && <span className="demo-tag">Demo</span>}
          <h2 style={{ marginTop: 10 }}>{r.guest_name}</h2>
          {repeat && <p className="meta warn-text">This phone number appears on another enquiry. Check for a duplicate or a returning guest.</p>}
        </div>
        <div className="quick">
          <a className="btn solid" href={`tel:${r.phone}`}>
            Call
          </a>
          <a className="btn solid wa" href={`https://wa.me/${wa}?text=${encodeURIComponent(chosen.text)}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {r.email && (
            <a className="btn outline" href={`mailto:${r.email}?subject=${encodeURIComponent(`Your enquiry with ${HOTEL.name}`)}&body=${encodeURIComponent(chosen.text)}`}>
              Email
            </a>
          )}
        </div>
        <div>
          <label className="lbl" htmlFor="d-tpl">
            Reply template
          </label>
          <select id="d-tpl" value={tpl} onChange={(e) => setTpl(e.target.value)}>
            {tlist.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="msg tpl-preview">{chosen.text}</div>
        </div>

        <div className="seg" role="tablist" aria-label="Enquiry sections">
          {[
            ['details', 'Details'],
            ['messages', 'Messages'],
            ['history', 'History'],
          ].map(([id, l]) => (
            <button key={id} role="tab" aria-selected={section === id} className={section === id ? 'on' : ''} onClick={() => setSection(id)}>
              {l}
            </button>
          ))}
        </div>

        {section === 'details' && (
          <>
            <dl>
              <dt>Phone</dt>
              <dd>{r.phone}</dd>
              <dt>Email</dt>
              <dd>{r.email || '–'}</dd>
              <dt>Type</dt>
              <dd>{r.enquiry_type === 'event' ? 'Wedding or event' : r.enquiry_type === 'meeting' ? 'Meeting' : 'Room stay'}</dd>
              <dt>{r.enquiry_type && r.enquiry_type !== 'stay' ? 'Dates' : 'Check-in'}</dt>
              <dd>{formatDate(r.check_in)}</dd>
              <dt>Check-out</dt>
              <dd>
                {formatDate(r.check_out)} ({nightsLabel(r.check_in, r.check_out)})
              </dd>
              <dt>Guests</dt>
              <dd>{r.enquiry_type && r.enquiry_type !== 'stay' ? `${r.event_guests || 'Not given'}` : `${r.adults} adults, ${r.children || 0} children`}</dd>
              <dt>Room</dt>
              <dd>{r.room_type || 'No preference'}</dd>
              {r.pickup && r.pickup !== 'none' && (
                <>
                  <dt>Pick-up</dt>
                  <dd>{label(PICKUPS, r.pickup)}</dd>
                </>
              )}
              {r.addons?.length > 0 && (
                <>
                  <dt>Extras</dt>
                  <dd>{r.addons.map((a) => label(ADDONS, a)).join(', ')}</dd>
                </>
              )}
              {r.callback_time && (
                <>
                  <dt>Call</dt>
                  <dd>{r.callback_time}</dd>
                </>
              )}
              {r.promo_code && (
                <>
                  <dt>Offer code</dt>
                  <dd>{r.promo_code}</dd>
                </>
              )}
              <dt>Came from</dt>
              <dd>{sourceLabel(r)}</dd>
              <dt>Account</dt>
              <dd>{r.userId ? 'Signed-in guest' : 'Not signed in'}</dd>
              <dt>Received</dt>
              <dd>{r.created_at?.toDate ? r.created_at.toDate().toLocaleString('en-IN') : ''}</dd>
            </dl>
            {r.message && (
              <div>
                <span className="lbl">Guest message</span>
                <div className="msg">{r.message}</div>
              </div>
            )}
            {ci && (
              <div>
                <span className="lbl">Online check-in</span>
                <div className="msg">
                  Arrival {ci.arrival_time || 'not given'}
                  {ci.guest_names ? `\nGuests: ${ci.guest_names}` : ''}
                  {ci.vehicle ? `\nVehicle: ${ci.vehicle}` : ''}
                  {ci.notes ? `\nNotes: ${ci.notes}` : ''}
                </div>
              </div>
            )}
            {canEdit ? (
              <>
                <div className="drawer-row">
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
                    <label className="lbl" htmlFor="d-follow">
                      Follow up on
                    </label>
                    <input id="d-follow" type="date" value={follow} onChange={(e) => setFollow(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="lbl" htmlFor="d-assign">
                    Assigned to
                  </label>
                  <input id="d-assign" list="staff-list" value={assigned} onChange={(e) => setAssigned(e.target.value)} placeholder="Staff email" />
                  <datalist id="staff-list">
                    {staffList.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  {!assigned && (
                    <button type="button" className="text-btn" onClick={() => setAssigned(me)}>
                      Assign to me
                    </button>
                  )}
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
              </>
            ) : (
              <p className="meta">Your account can view enquiries but not change them.</p>
            )}
          </>
        )}
        {section === 'messages' && <Thread id={r.id} me={me} canEdit={canEdit} />}
        {section === 'history' && <History id={r.id} />}
      </motion.aside>
    </div>
  );
}
