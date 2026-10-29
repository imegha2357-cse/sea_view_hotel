import { useEffect, useState } from 'react';
import { fb } from '../../lib/firebase';
import { clearBlockedCache } from '../../lib/availability';
import { todayISO } from '../../lib/enquiry';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';

// Feature #1 (staff side): mark nights when the hotel is fully booked. Guests see them greyed out.
export default function AvailabilityEditor({ canEdit, me }) {
  const [blocked, setBlocked] = useState(null);
  const [orig, setOrig] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { db, F } = fb();
    F.getDoc(F.doc(db, 'settings', 'availability'))
      .then((s) => {
        const b = (s.exists() ? s.data().blocked || [] : []).filter((d) => d >= todayISO()).sort();
        setBlocked(b);
        setOrig(b);
      })
      .catch(() => {
        setBlocked([]);
        setMsg('Could not load saved dates.');
      });
  }, []);

  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      const { db, F } = fb();
      const list = blocked.filter((d) => d >= todayISO()).sort().slice(0, 400);
      await F.setDoc(F.doc(db, 'settings', 'availability'), { blocked: list, updated_at: F.serverTimestamp(), updated_by: me.slice(0, 120) });
      clearBlockedCache();
      setOrig(list);
      setMsg('Saved. The website now shows these nights as fully booked.');
    } catch (err) {
      setMsg(err?.code === 'permission-denied' ? 'Firebase refused this. Publish the latest firestore.rules, then try again.' : 'Not saved. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!blocked) return <div className="panel">Loading…</div>;
  const changed = blocked.join() !== orig.join();
  return (
    <section className="panel" aria-labelledby="avail-h">
      <h2 id="avail-h">Fully booked nights</h2>
      <p className="meta" style={{ marginBottom: 14 }}>
        {canEdit ? 'Click a night to mark it fully booked; click again to open it. Guests cannot pick a stay that includes a booked night, and are offered WhatsApp instead.' : 'Nights the hotel has marked fully booked.'}
      </p>
      <div style={{ pointerEvents: canEdit ? 'auto' : 'none' }}>
        <AvailabilityCalendar mode="toggle" blocked={blocked} onChange={setBlocked} months={3} />
      </div>
      {canEdit && (
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn solid" onClick={save} disabled={busy || !changed}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save {blocked.length} booked {blocked.length === 1 ? 'night' : 'nights'}
          </button>
          {changed && (
            <button className="text-btn" onClick={() => setBlocked(orig)}>
              Undo changes
            </button>
          )}
          {msg && <span className="saved">{msg}</span>}
        </div>
      )}
    </section>
  );
}
