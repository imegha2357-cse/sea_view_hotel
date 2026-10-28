import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../components/Motion';
import { todayISO } from '../lib/enquiry';

// Taj-style booking bar under the hero. It never checks live availability (PRD WS-03);
// it pre-fills the enquiry form and scrolls to it.
export default function BookingBar({ onPrefill }) {
  const [v, setV] = useState({ check_in: '', check_out: '', adults: 2, children: 0 });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const minOut = v.check_in || todayISO();

  const submit = (e) => {
    e.preventDefault();
    onPrefill({ ...v, adults: +v.adults, children: +v.children });
    document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div className="booking-bar container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}>
      <form onSubmit={submit} aria-label="Check room availability">
        <div className="bb-field">
          <label htmlFor="bb-in">Check-in</label>
          <input id="bb-in" type="date" min={todayISO()} value={v.check_in} onChange={set('check_in')} />
        </div>
        <div className="bb-field">
          <label htmlFor="bb-out">Check-out</label>
          <input id="bb-out" type="date" min={minOut} value={v.check_out} onChange={set('check_out')} />
        </div>
        <div className="bb-field">
          <label htmlFor="bb-ad">Adults</label>
          <select id="bb-ad" value={v.adults} onChange={set('adults')}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="bb-field">
          <label htmlFor="bb-ch">Children</label>
          <select id="bb-ch" value={v.children} onChange={set('children')}>
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <button className="btn solid gold" type="submit">
          Check availability
        </button>
      </form>
      <p className="note">We confirm availability and price personally by phone or WhatsApp.</p>
    </motion.div>
  );
}
