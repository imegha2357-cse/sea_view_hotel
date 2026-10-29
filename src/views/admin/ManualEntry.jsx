'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fb } from '../../lib/firebase';
import { todayISO } from '../../lib/enquiry';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import { ROOM_TYPES } from '../../data/content';
import { EASE } from '../../components/Motion';

// Feature #49: staff record enquiries that arrive by phone, walk-in or email, so every lead is in one list.
export default function ManualEntry({ onClose, me }) {
  const [v, setV] = useState({ source: 'phone', guest_name: '', phone: '', email: '', check_in: '', check_out: '', adults: 2, children: 0, room_type: '', message: '', status: 'New' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    lockScroll();
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', k);
    };
  }, [onClose]);
  const f = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    if (!v.guest_name.trim() || !v.phone.trim()) return setErr('Name and phone are required.');
    if (!v.check_in || !v.check_out || v.check_out <= v.check_in) return setErr('Choose a check-in and a later check-out date.');
    setBusy(true);
    try {
      const { db, F } = fb();
      const ts = (iso) => F.Timestamp.fromDate(new Date(`${iso}T12:00:00`));
      const now = F.Timestamp.now();
      await F.addDoc(F.collection(db, 'booking_enquiries'), {
        source: v.source,
        status: v.status,
        guest_name: v.guest_name.trim().slice(0, 80),
        phone: v.phone.trim().slice(0, 20),
        email: v.email.trim() || null,
        check_in: ts(v.check_in),
        check_out: ts(v.check_out),
        adults: Math.max(1, +v.adults || 1),
        children: Math.max(0, +v.children || 0),
        room_type: v.room_type || null,
        message: v.message.trim().slice(0, 1000) || null,
        enquiry_type: 'stay',
        userId: null,
        assigned_to: me.slice(0, 120),
        staff_notes: `Entered by ${me}`.slice(0, 2000),
        created_at: now,
        updated_at: now,
      });
      onClose();
    } catch (x) {
      setErr(x?.code === 'permission-denied' ? 'Firebase refused this. Publish the latest firestore.rules, then try again.' : 'Not saved. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label="New enquiry">
      <motion.div className="drawer-bg" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="drawer" data-lenis-prevent initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: EASE }}>
        <button className="x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>New enquiry</h2>
        <form onSubmit={save} className="manual-form">
          <label className="lbl" htmlFor="m-src">
            Received by
          </label>
          <select id="m-src" value={v.source} onChange={f('source')}>
            <option value="phone">Phone call</option>
            <option value="walk_in">Walk-in</option>
            <option value="email">Email</option>
          </select>
          <label className="lbl" htmlFor="m-name">
            Guest name *
          </label>
          <input id="m-name" value={v.guest_name} onChange={f('guest_name')} maxLength={80} />
          <label className="lbl" htmlFor="m-phone">
            Phone *
          </label>
          <input id="m-phone" type="tel" value={v.phone} onChange={f('phone')} maxLength={20} />
          <label className="lbl" htmlFor="m-email">
            Email
          </label>
          <input id="m-email" type="email" value={v.email} onChange={f('email')} maxLength={120} />
          <div className="drawer-row">
            <div>
              <label className="lbl" htmlFor="m-in">
                Check-in *
              </label>
              <input id="m-in" type="date" min={todayISO()} value={v.check_in} onChange={f('check_in')} />
            </div>
            <div>
              <label className="lbl" htmlFor="m-out">
                Check-out *
              </label>
              <input id="m-out" type="date" min={v.check_in || todayISO()} value={v.check_out} onChange={f('check_out')} />
            </div>
            <div>
              <label className="lbl" htmlFor="m-ad">
                Adults
              </label>
              <input id="m-ad" type="number" min="1" max="20" value={v.adults} onChange={f('adults')} />
            </div>
            <div>
              <label className="lbl" htmlFor="m-ch">
                Children
              </label>
              <input id="m-ch" type="number" min="0" max="20" value={v.children} onChange={f('children')} />
            </div>
          </div>
          <label className="lbl" htmlFor="m-room">
            Room
          </label>
          <select id="m-room" value={v.room_type} onChange={f('room_type')}>
            <option value="">No preference</option>
            {ROOM_TYPES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <label className="lbl" htmlFor="m-msg">
            Notes from the guest
          </label>
          <textarea id="m-msg" value={v.message} onChange={f('message')} maxLength={1000} />
          {err && <p className="form-alert">{err}</p>}
          <div className="form-actions">
            <button className="btn solid" type="submit" disabled={busy}>
              {busy && <span className="spin" aria-hidden="true" />}
              Save enquiry
            </button>
          </div>
        </form>
      </motion.aside>
    </div>
  );
}
