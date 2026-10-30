'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { fb } from '@/lib/firebase';
import { slugify } from '@/data/catalog';
import { HK_STATES, REQUEST_TYPES, THEMES } from '@/data/lists';
import {
  deletePost,
  friendlyError,
  loadContent,
  loadHistory,
  loadInventory,
  loadPosts,
  loadSettings,
  publishChanges,
  restore,
  saveInventory,
  savePost,
  saveSettings,
} from '@/lib/cms-admin';
import { ConfirmButton, PhotoPicker, Thumb } from './content/PhotoTools';

const Msg = ({ m }) =>
  m ? (
    <p className={m.ok ? 'cm-ok' : 'form-alert'} role={m.ok ? 'status' : 'alert'}>
      {m.text}
    </p>
  ) : null;
const when = (t) => {
  const d = t?.toDate?.() || (t ? new Date(t) : null);
  return d && !isNaN(d) ? d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
};
const stamp = (me) => ({ updated_at: fb().F.serverTimestamp(), updated_by: String(me || '').slice(0, 120) });

// ---------- Settings: seasonal theme, social links, times, review link, loyalty, room guide ----------
const SOCIAL = ['instagram', 'facebook', 'youtube', 'x', 'google'];
const STAY_KEYS = [
  ['wifi', 'Wi-Fi name and how to get the password'],
  ['breakfast', 'Breakfast time and place'],
  ['reception', 'Reception phone extension'],
  ['roomservice', 'Room service hours and extension'],
  ['housekeeping', 'Housekeeping hours'],
  ['laundry', 'Laundry'],
  ['emergency', 'In an emergency'],
];
export function SettingsPanel({ me, canEdit }) {
  const [v, setV] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    loadSettings()
      .then((s) => setV({ theme: 'none', social: {}, check_in: '', check_out: '', review_link: '', loyalty_rules: '', stay_info: {}, ...s }))
      .catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
  }, []);
  if (!v) return <section className="panel">{msg ? <Msg m={msg} /> : 'Loading…'}</section>;
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const setIn = (o, k) => (e) => setV((x) => ({ ...x, [o]: { ...(x[o] || {}), [k]: e.target.value } }));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const bad = SOCIAL.find((k) => v.social?.[k] && !/^https:\/\/\S+$/.test(v.social[k]));
      if (bad) throw new Error(`The ${bad} link must start with https://`);
      if (v.review_link && !/^https:\/\/\S+$/.test(v.review_link)) throw new Error('The review link must start with https://');
      const trim = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, x]) => [k, String(x || '').trim().slice(0, 300)]).filter(([, x]) => x));
      await saveSettings(
        {
          theme: v.theme,
          social: trim(v.social),
          check_in: v.check_in.trim().slice(0, 40),
          check_out: v.check_out.trim().slice(0, 40),
          review_link: v.review_link.trim().slice(0, 300),
          loyalty_rules: v.loyalty_rules.trim().slice(0, 2000),
          stay_info: trim(v.stay_info),
        },
        me
      );
      setMsg({ ok: true, text: 'Saved. The website is updated.' });
    } catch (x) {
      setMsg({ ok: false, text: friendlyError(x) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel cm-editor" onSubmit={save}>
      <fieldset disabled={!canEdit || busy} className="cm-fields">
        <h2>Seasonal look</h2>
        <label className="cm-field">
          <span className="lbl">Festival theme (a greeting ribbon at the top of the website)</span>
          <select className="cm-input" value={v.theme} onChange={set('theme')}>
            {THEMES.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <h2>Check-in and check-out</h2>
        <p className="meta">Shown on the Policies page, in the room guide and used by the chat assistant. Leave empty if not fixed.</p>
        <div className="cm-grid">
          <label className="cm-field">
            <span className="lbl">Check-in from</span>
            <input className="cm-input" value={v.check_in} onChange={set('check_in')} placeholder="e.g. 12:00 noon" maxLength={40} />
          </label>
          <label className="cm-field">
            <span className="lbl">Check-out by</span>
            <input className="cm-input" value={v.check_out} onChange={set('check_out')} placeholder="e.g. 11:00 am" maxLength={40} />
          </label>
        </div>
        <h2>Social media and reviews</h2>
        <div className="cm-grid">
          {SOCIAL.map((k) => (
            <label key={k} className="cm-field">
              <span className="lbl">{k === 'x' ? 'X (Twitter)' : k === 'google' ? 'Google Business Profile' : k[0].toUpperCase() + k.slice(1)} link</span>
              <input className="cm-input" value={v.social?.[k] || ''} onChange={setIn('social', k)} placeholder="https://" />
            </label>
          ))}
          <label className="cm-field">
            <span className="lbl">"Write a review" link (sent to guests after their stay)</span>
            <input className="cm-input" value={v.review_link} onChange={set('review_link')} placeholder="https://g.page/r/…/review" />
          </label>
        </div>
        <h2>Loyalty points</h2>
        <label className="cm-field">
          <span className="lbl">How guests earn and use points (shown in the guest account)</span>
          <textarea className="cm-input" rows={3} value={v.loyalty_rules} onChange={set('loyalty_rules')} maxLength={2000} placeholder="Leave empty to hide loyalty points from guests." />
        </label>
        <h2>Digital room guide</h2>
        <p className="meta">Shown at /stay (the QR code in each room). Leave a line empty to hide it.</p>
        <div className="cm-grid">
          {STAY_KEYS.map(([k, l]) => (
            <label key={k} className="cm-field">
              <span className="lbl">{l}</span>
              <input className="cm-input" value={v.stay_info?.[k] || ''} onChange={setIn('stay_info', k)} maxLength={300} />
            </label>
          ))}
        </div>
      </fieldset>
      {canEdit && (
        <div className="form-actions">
          <button className="btn solid" disabled={busy}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save settings
          </button>
        </div>
      )}
      <Msg m={msg} />
    </form>
  );
}

// ---------- Blog / news ----------
function PostEditor({ post, me, canEdit, onDone }) {
  const isNew = !post.slug;
  const [v, setV] = useState({ title: '', summary: '', body: '', image: '', date: new Date().toISOString().slice(0, 10), published: false, ...post });
  const [media, setMedia] = useState(null);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const openPicker = async () => {
    if (!media) setMedia((await loadContent()).media);
    setPicker(true);
  };
  const save = async (e) => {
    e.preventDefault();
    setErr('');
    const slug = isNew ? slugify(v.title).slice(0, 60) : post.slug;
    if (!v.title.trim() || !slug) return setErr('Give the post a title.');
    if (!v.body.trim()) return setErr('Write the post.');
    setBusy(true);
    try {
      await savePost(slug, { title: v.title.trim().slice(0, 120), summary: v.summary.trim().slice(0, 300), body: v.body.slice(0, 20000), image: v.image || '', date: v.date, published: Boolean(v.published) }, me);
      onDone(`${v.title.trim()} saved.`);
    } catch (x) {
      setErr(friendlyError(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel cm-editor" onSubmit={save}>
      <div className="cm-editor-head">
        <h2>{isNew ? 'Write a post' : `Edit: ${post.title}`}</h2>
        <button type="button" className="text-btn" onClick={() => onDone()}>
          ← Back to posts
        </button>
      </div>
      <fieldset disabled={!canEdit || busy} className="cm-fields">
        <div className="cm-grid">
          <label className="cm-field">
            <span className="lbl">Title *</span>
            <input className="cm-input" value={v.title} onChange={set('title')} maxLength={120} required />
          </label>
          <label className="cm-field">
            <span className="lbl">Date</span>
            <input className="cm-input" type="date" value={v.date} onChange={set('date')} />
          </label>
        </div>
        <label className="cm-field">
          <span className="lbl">Summary (one or two lines)</span>
          <input className="cm-input" value={v.summary} onChange={set('summary')} maxLength={300} />
        </label>
        <label className="cm-field">
          <span className="lbl">Post *</span>
          <textarea className="cm-input" rows={14} value={v.body} onChange={set('body')} maxLength={20000} />
          <small className="meta">Leave an empty line between paragraphs. Start a line with "## " for a heading.</small>
        </label>
        <div className="cm-field">
          <span className="lbl">Photo</span>
          <div className="cm-inline">
            <Thumb refKey={v.image} size="lg" />
            <button type="button" className="text-btn" onClick={openPicker}>
              {v.image ? 'Change photo' : 'Choose photo'}
            </button>
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={v.published} onChange={set('published')} />
          <span>Publish on the website</span>
        </label>
      </fieldset>
      {err && (
        <p className="form-alert" role="alert">
          {err}
        </p>
      )}
      {canEdit && (
        <div className="form-actions">
          <button className="btn solid" disabled={busy}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save post
          </button>
        </div>
      )}
      <AnimatePresence>
        {picker && media && (
          <PhotoPicker
            media={media}
            me={me}
            onUploaded={async () => setMedia((await loadContent()).media)}
            onClose={() => setPicker(false)}
            onPick={(ref) => {
              setV((x) => ({ ...x, image: ref }));
              setPicker(false);
            }}
          />
        )}
      </AnimatePresence>
    </form>
  );
}
export function BlogPanel({ me, canEdit }) {
  const [posts, setPosts] = useState(null);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState(null);
  const reload = () =>
    loadPosts()
      .then(setPosts)
      .catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
  useEffect(() => {
    reload();
  }, []);
  if (edit)
    return (
      <PostEditor
        post={edit}
        me={me}
        canEdit={canEdit}
        onDone={(m) => {
          setEdit(null);
          if (m) setMsg({ ok: true, text: m });
          reload();
        }}
      />
    );
  return (
    <section className="panel">
      <div className="cm-editor-head">
        <h2>Posts {posts && `(${posts.length})`}</h2>
        {canEdit && (
          <button type="button" className="btn solid sm" onClick={() => setEdit({})}>
            ＋ Write a post
          </button>
        )}
      </div>
      <Msg m={msg} />
      {posts?.length === 0 && <p className="meta">No posts yet. The News page stays hidden from the menu until you publish one.</p>}
      <ul className="cm-list">
        {posts?.map((p) => (
          <li key={p.slug}>
            <Thumb refKey={p.image} />
            <div className="cm-list-main">
              <b>{p.title}</b>
              <span className="meta">
                {p.date} {!p.published && <span className="pill st-Cancelled">Draft</span>}
              </span>
            </div>
            <div className="cm-row-actions">
              <button type="button" className="text-btn" onClick={() => setEdit(p)}>
                {canEdit ? 'Edit' : 'Read'}
              </button>
              {canEdit && (
                <ConfirmButton
                  confirm={`Delete ${p.title}`}
                  onConfirm={async () => {
                    await deletePost(p.slug, me).catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
                    reload();
                  }}
                >
                  Delete
                </ConfirmButton>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Rooms left per night (inventory) ----------
const isoDay = (d) => d.toISOString().slice(0, 10);
export function InventoryPanel({ me, canEdit }) {
  const [rooms, setRooms] = useState(null);
  const [inv, setInv] = useState({});
  const [room, setRoom] = useState('');
  const [start, setStart] = useState(() => isoDay(new Date()));
  const [draft, setDraft] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([loadContent(), loadInventory()])
      .then(([c, i]) => {
        setRooms(c.rooms);
        setInv(i);
        setRoom(c.rooms[0]?.id || '');
      })
      .catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
  }, []);
  useEffect(() => setDraft(inv[room] || {}), [room, inv]);
  const days = useMemo(() => Array.from({ length: 28 }, (_, i) => isoDay(new Date(new Date(start + 'T00:00:00Z').getTime() + i * 864e5))), [start]);
  if (!rooms) return <section className="panel">{msg ? <Msg m={msg} /> : 'Loading…'}</section>;
  if (!rooms.length) return <section className="panel">Import the website content first (Website → Rooms).</section>;
  const today = isoDay(new Date());
  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      // Keep only today and later, so the document stays small.
      const counts = Object.fromEntries(Object.entries(draft).filter(([d, n]) => d >= today && n !== '' && n !== null && !isNaN(n)).map(([d, n]) => [d, Math.max(0, Math.min(99, parseInt(n, 10)))]));
      await saveInventory(room, counts, me);
      setInv((x) => ({ ...x, [room]: counts }));
      setMsg({ ok: true, text: 'Saved. Guests now see "Only N left" when 3 or fewer rooms are free, and cannot pick nights at 0.' });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel">
      <p className="meta">Enter how many rooms of this type are still free each night. Leave a night empty if you do not want to show a number.</p>
      <div className="cm-grid">
        <label className="cm-field">
          <span className="lbl">Room type</span>
          <select className="cm-input" value={room} onChange={(e) => setRoom(e.target.value)}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="cm-field">
          <span className="lbl">Starting from</span>
          <input className="cm-input" type="date" min={today} value={start} onChange={(e) => setStart(e.target.value || today)} />
        </label>
      </div>
      <div className="inv-grid">
        {days.map((d) => {
          const dt = new Date(d + 'T00:00:00Z');
          const n = draft[d];
          return (
            <label key={d} className={`inv-day ${n === 0 || n === '0' ? 'full' : ''} ${[0, 6].includes(dt.getUTCDay()) ? 'wk' : ''}`}>
              <span>{dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</span>
              <input
                type="number"
                min={0}
                max={99}
                inputMode="numeric"
                value={n ?? ''}
                disabled={!canEdit}
                onChange={(e) => setDraft((x) => ({ ...x, [d]: e.target.value === '' ? '' : Number(e.target.value) }))}
                aria-label={`Rooms free on ${d}`}
              />
            </label>
          );
        })}
      </div>
      {canEdit && (
        <div className="form-actions">
          <button type="button" className="btn solid sm" onClick={save} disabled={busy}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save room counts
          </button>
        </div>
      )}
      <Msg m={msg} />
    </section>
  );
}

// ---------- Requests from the website forms ----------
const ST = ['New', 'In progress', 'Done', 'Cancelled'];
export function RequestsPanel({ canEdit }) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('open');
  const [err, setErr] = useState('');
  useEffect(() => {
    const { db, F } = fb();
    return F.onSnapshot(
      F.query(F.collection(db, 'requests'), F.orderBy('created_at', 'desc'), F.limit(200)),
      (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setErr('Could not load. Publish the latest firestore.rules.')
    );
  }, []);
  const upd = async (id, patch) => {
    const { db, F } = fb();
    await F.updateDoc(F.doc(db, 'requests', id), { ...patch, updated_at: F.serverTimestamp() }).catch((e) => setErr(friendlyError(e)));
  };
  const shown = (items || []).filter((r) => (filter === 'open' ? !['Done', 'Cancelled'].includes(r.status) : filter === 'all' ? true : r.type === filter));
  const wa = (r) => `https://wa.me/${String(r.phone).replace(/\D/g, '').replace(/^(?=\d{10}$)/, '91')}`;
  return (
    <section className="panel">
      <div className="cm-editor-head">
        <h2>Requests {items && <small className="count">{shown.length}</small>}</h2>
        <select className="cm-input" style={{ maxWidth: 240 }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Show">
          <option value="open">Open requests</option>
          <option value="all">All requests</option>
          {Object.entries(REQUEST_TYPES).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </div>
      {err && <p className="form-alert">{err}</p>}
      {items && !shown.length && <p className="meta">Nothing here. Requests from the group, corporate, gift, tours, table, celebration, agent, call-back and room-guide forms appear here.</p>}
      <ul className="req-list">
        {shown.map((r) => (
          <li key={r.id} className="req-item">
            <div className="req-top">
              <span className="pill">{REQUEST_TYPES[r.type] || r.type}</span>
              <b>{r.name}</b>
              {r.room_number && <span className="meta">Room {r.room_number}</span>}
              <span className="meta">{when(r.created_at)}</span>
            </div>
            <p className="meta">
              <a href={`tel:${r.phone}`}>{r.phone}</a> · <a href={wa(r)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {r.email && (
                <>
                  {' · '}
                  <a href={`mailto:${r.email}`}>{r.email}</a>
                </>
              )}
            </p>
            {r.fields && Object.keys(r.fields).length > 0 && (
              <dl className="req-fields">
                {Object.entries(r.fields).map(([k, x]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{String(x)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {r.message && <p className="req-msg">{r.message}</p>}
            <div className="cm-inline">
              <select className="cm-input" value={r.status} disabled={!canEdit} onChange={(e) => upd(r.id, { status: e.target.value })} aria-label="Status">
                {ST.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input className="cm-input" placeholder="Staff note" defaultValue={r.staff_note || ''} disabled={!canEdit} maxLength={1000} onBlur={(e) => e.target.value !== (r.staff_note || '') && upd(r.id, { staff_note: e.target.value })} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Housekeeping board ----------
export function HousekeepingPanel({ me, staffRole }) {
  const [board, setBoard] = useState(null);
  const [add, setAdd] = useState('');
  const [err, setErr] = useState('');
  const can = staffRole === 'owner' || staffRole === 'desk';
  useEffect(() => {
    const { db, F } = fb();
    return F.onSnapshot(
      F.doc(db, 'housekeeping', 'board'),
      (s) => setBoard(s.exists() ? s.data().rooms || {} : {}),
      () => setErr('Could not load. Publish the latest firestore.rules.')
    );
  }, []);
  const write = async (rooms) => {
    const { db, F } = fb();
    setBoard(rooms);
    await F.setDoc(F.doc(db, 'housekeeping', 'board'), { rooms, ...stamp(me) }).catch((e) => setErr(friendlyError(e)));
  };
  if (!board) return <section className="panel">{err || 'Loading…'}</section>;
  const nums = Object.keys(board).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const counts = Object.fromEntries(HK_STATES.map(([k]) => [k, nums.filter((n) => board[n].s === k).length]));
  return (
    <section className="panel">
      {err && <p className="form-alert">{err}</p>}
      <p className="hk-sum">
        {HK_STATES.map(([k, l]) => (
          <span key={k} className={`hk-chip hk-${k}`}>
            {l}: {counts[k]}
          </span>
        ))}
      </p>
      {can && (
        <form
          className="cm-inline"
          onSubmit={(e) => {
            e.preventDefault();
            const list = add
              .split(/[,\s]+/)
              .map((x) => x.trim().slice(0, 8))
              .filter(Boolean);
            const next = { ...board };
            for (const n of list) {
              if (/^\d+-\d+$/.test(n)) {
                const [a, b] = n.split('-').map(Number);
                for (let i = a; i <= Math.min(b, a + 100); i++) next[String(i)] ||= { s: 'clean', by: me, at: Date.now() };
              } else next[n] ||= { s: 'clean', by: me, at: Date.now() };
            }
            setAdd('');
            write(next);
          }}
        >
          <input className="cm-input" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add room numbers, e.g. 101 102 or 201-210" aria-label="Add room numbers" />
          <button className="btn outline sm">Add rooms</button>
        </form>
      )}
      {!nums.length && <p className="meta">Add your room numbers to start the board.</p>}
      <ul className="hk-grid">
        {nums.map((n) => (
          <li key={n} className={`hk-room hk-${board[n].s}`}>
            <b>{n}</b>
            <select value={board[n].s} disabled={!can} onChange={(e) => write({ ...board, [n]: { s: e.target.value, by: me, at: Date.now() } })} aria-label={`Room ${n} status`}>
              {HK_STATES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <small>{board[n].at ? new Date(board[n].at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</small>
            {can && (
              <button
                type="button"
                className="text-btn muted"
                aria-label={`Remove room ${n}`}
                onClick={() => {
                  const { [n]: _x, ...rest } = board;
                  write(rest);
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Guests: loyalty points and occasions ----------
export function GuestsPanel({ me, canEdit }) {
  const [users, setUsers] = useState(null);
  const [loy, setLoy] = useState({});
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const { db, F } = fb();
    Promise.all([F.getDocs(F.query(F.collection(db, 'users'), F.limit(500))), F.getDocs(F.collection(db, 'loyalty'))])
      .then(([u, l]) => {
        setUsers(u.docs.map((d) => ({ uid: d.id, ...d.data() })).filter((x) => x.role !== 'admin'));
        setLoy(Object.fromEntries(l.docs.map((d) => [d.id, d.data()])));
      })
      .catch((e) => setErr(friendlyError(e)));
  }, []);
  const award = async (u, pts, note) => {
    setMsg(null);
    const cur = loy[u.uid] || { points: 0, history: [] };
    const points = Math.max(0, (cur.points || 0) + pts);
    const rec = { points, history: [{ pts, note: String(note || '').slice(0, 120), at: new Date().toISOString(), by: me }, ...(cur.history || [])].slice(0, 200), name: String(u.name || '').slice(0, 80), email: String(u.email || '').slice(0, 120), ...stamp(me) };
    try {
      const { db, F } = fb();
      await F.setDoc(F.doc(db, 'loyalty', u.uid), rec);
      setLoy((x) => ({ ...x, [u.uid]: { ...rec, updated_at: null } }));
      setMsg({ ok: true, text: `${pts > 0 ? 'Added' : 'Removed'} ${Math.abs(pts)} points for ${u.name || u.email}.` });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    }
  };
  if (!users) return <section className="panel">{err || 'Loading…'}</section>;
  const md = (s) => (s ? String(s).slice(5) : '');
  const soon = (s) => {
    if (!s) return false;
    const now = new Date();
    for (let i = 0; i < 31; i++) {
      const d = new Date(now.getTime() + i * 864e5);
      if (isoDay(d).slice(5) === md(s)) return true;
    }
    return false;
  };
  const list = users.filter((u) => !q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));
  const upcoming = users.filter((u) => u.occasion_offers && (soon(u.birthday) || soon(u.anniversary)));
  return (
    <section className="panel">
      <Msg m={msg} />
      {upcoming.length > 0 && (
        <div className="info-box">
          <b>Occasions in the next 30 days</b> (guests who asked for occasion offers):
          <ul>
            {upcoming.map((u) => (
              <li key={u.uid}>
                {u.name || u.email}: {soon(u.birthday) ? `birthday ${md(u.birthday)}` : ''} {soon(u.anniversary) ? `anniversary ${md(u.anniversary)}` : ''} {u.phone && <a href={`https://wa.me/${String(u.phone).replace(/\D/g, '')}`}>WhatsApp</a>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <input className="cm-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests by name, email or phone" aria-label="Search guests" />
      <p className="meta">{users.length} guest accounts.</p>
      <ul className="cm-list">
        {list.slice(0, 100).map((u) => (
          <li key={u.uid}>
            <div className="cm-list-main">
              <b>{u.name || '(no name)'}</b>
              <span className="meta">
                {u.email} {u.phone && `· ${u.phone}`} · {loy[u.uid]?.points || 0} points
              </span>
            </div>
            {canEdit && (
              <form
                className="cm-inline"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const n = parseInt(f.get('pts'), 10);
                  if (n) award(u, n, f.get('note'));
                  e.currentTarget.reset();
                }}
              >
                <input name="pts" type="number" className="cm-input" style={{ width: 90 }} placeholder="± pts" aria-label="Points" />
                <input name="note" className="cm-input" style={{ width: 160 }} placeholder="Reason" aria-label="Reason" maxLength={120} />
                <button className="text-btn">Save</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Staff accounts (owners only) ----------
export function StaffPanel({ me, user, staffRole }) {
  const [staff, setStaff] = useState(null);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('desk');
  const [msg, setMsg] = useState(null);
  const reload = async () => {
    const { db, F } = fb();
    const [a, u] = await Promise.all([F.getDocs(F.collection(db, 'admins')), F.getDocs(F.query(F.collection(db, 'users'), F.limit(500)))]);
    setStaff(a.docs.map((d) => ({ uid: d.id, ...d.data() })));
    setUsers(u.docs.map((d) => ({ uid: d.id, ...d.data() })));
  };
  useEffect(() => {
    reload().catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
  }, []);
  if (staffRole !== 'owner') return <section className="panel">Only owner accounts can manage staff.</section>;
  if (!staff) return <section className="panel">{msg ? <Msg m={msg} /> : 'Loading…'}</section>;
  const setStaffRole = async (uid, data) => {
    setMsg(null);
    try {
      const { db, F } = fb();
      await F.setDoc(F.doc(db, 'admins', uid), { ...data, added_by: me, updated_at: F.serverTimestamp() });
      await reload();
      setMsg({ ok: true, text: 'Saved. The change applies the next time they sign in.' });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    }
  };
  const addStaff = (e) => {
    e.preventDefault();
    const u = users.find((x) => String(x.email || '').toLowerCase() === email.trim().toLowerCase());
    if (!u) return setMsg({ ok: false, text: 'No account with that email. Ask them to create a guest account on the website first (Sign in → Create account), then add them here.' });
    if (staff.some((s) => s.uid === u.uid)) return setMsg({ ok: false, text: 'They are already staff.' });
    setStaffRole(u.uid, { email: String(u.email).slice(0, 120), name: String(u.name || '').slice(0, 80), role });
    setEmail('');
  };
  const ROLES = [
    ['owner', 'Owner: everything, including staff'],
    ['desk', 'Front desk: edit website and hotel tools'],
    ['viewer', 'View only'],
  ];
  return (
    <section className="panel">
      <Msg m={msg} />
      <ul className="cm-list">
        {staff.map((s) => (
          <li key={s.uid}>
            <div className="cm-list-main">
              <b>{s.name || s.email || s.uid}</b>
              <span className="meta">
                {s.email} {s.uid === user?.uid && '(you)'}
              </span>
            </div>
            <div className="cm-row-actions">
              <select className="cm-input" value={s.role || 'owner'} disabled={s.uid === user?.uid} onChange={(e) => setStaffRole(s.uid, { email: String(s.email || '').slice(0, 120), name: String(s.name || '').slice(0, 80), role: e.target.value })} aria-label="Role">
                {ROLES.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              {s.uid !== user?.uid && (
                <ConfirmButton
                  confirm={`Remove ${s.email || 'this person'}`}
                  onConfirm={async () => {
                    const { db, F } = fb();
                    await F.deleteDoc(F.doc(db, 'admins', s.uid)).catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
                    reload();
                  }}
                >
                  Remove
                </ConfirmButton>
              )}
            </div>
          </li>
        ))}
      </ul>
      <form className="cm-editor" onSubmit={addStaff}>
        <h2>Add a staff member</h2>
        <div className="cm-grid">
          <label className="cm-field">
            <span className="lbl">Their account email</span>
            <input className="cm-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="cm-field">
            <span className="lbl">Role</span>
            <select className="cm-input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn solid sm">Add staff</button>
      </form>
    </section>
  );
}

// ---------- Change history with undo ----------
export function HistoryPanel({ me, canEdit }) {
  const [items, setItems] = useState(null);
  const [msg, setMsg] = useState(null);
  const reload = () =>
    loadHistory(80)
      .then(setItems)
      .catch((e) => setMsg({ ok: false, text: friendlyError(e) }));
  useEffect(() => {
    reload();
  }, []);
  if (!items) return <section className="panel">{msg ? <Msg m={msg} /> : 'Loading…'}</section>;
  return (
    <section className="panel">
      <Msg m={msg} />
      {!items.length && <p className="meta">No changes recorded yet. Every change to rooms, offers, lists, posts, settings, slides and the gallery is recorded here.</p>}
      <ul className="cm-list">
        {items.map((h) => (
          <li key={h.id}>
            <div className="cm-list-main">
              <b>{h.note || h.path}</b>
              <span className="meta">
                {when(h.at)} · {h.by} · {h.path}
              </span>
            </div>
            {canEdit && (
              <ConfirmButton
                className="text-btn"
                confirm="Put it back as it was before"
                onConfirm={async () => {
                  setMsg(null);
                  try {
                    await restore(h, me);
                    setMsg({ ok: true, text: `Restored ${h.path} to how it was before "${h.note}".` });
                    reload();
                  } catch (e) {
                    setMsg({ ok: false, text: friendlyError(e) });
                  }
                }}
              >
                Undo this change
              </ConfirmButton>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- QR codes and website links ----------
const QR_LINKS = [
  ['/stay', 'Room guide (put one in every room)'],
  ['/dining/menu', 'Restaurant menu (for tables)'],
  ['/enquire', 'Enquiry form (for the reception desk)'],
  ['/', 'Website home (for brochures and cards)'],
];
export function QrPanel() {
  const [codes, setCodes] = useState({});
  const [room, setRoom] = useState('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  useEffect(() => {
    let off = false;
    import('qrcode').then(async (Q) => {
      const out = {};
      for (const [p] of QR_LINKS) out[p] = await Q.toDataURL(`${origin}${p}${p === '/stay' && room ? `?room=${encodeURIComponent(room)}` : ''}`, { margin: 2, width: 600, color: { dark: '#173B3A', light: '#FFFFFF' } });
      if (!off) setCodes(out);
    });
    return () => {
      off = true;
    };
  }, [origin, room]);
  return (
    <section className="panel">
      <p className="meta">Print these and place them in rooms, on tables and at reception. Guests scan them with their phone camera.</p>
      <label className="cm-field" style={{ maxWidth: 280 }}>
        <span className="lbl">Room number for the room-guide code (optional)</span>
        <input className="cm-input" value={room} onChange={(e) => setRoom(e.target.value.replace(/[^\w-]/g, '').slice(0, 8))} placeholder="e.g. 204" />
      </label>
      <ul className="qr-grid">
        {QR_LINKS.map(([p, l]) => (
          <li key={p}>
            {codes[p] ? <img src={codes[p]} alt={`QR code for ${l}`} width={200} height={200} /> : <span className="qr-ph" />}
            <b>{l}</b>
            <small className="meta">
              {origin}
              {p}
              {p === '/stay' && room ? `?room=${room}` : ''}
            </small>
            {codes[p] && (
              <a className="text-btn" href={codes[p]} download={`seaview-qr${p.replace(/\//g, '-') || '-home'}${p === '/stay' && room ? `-${room}` : ''}.png`}>
                Download
              </a>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="btn outline sm" onClick={() => window.print()}>
        Print this page
      </button>
      <button type="button" className="text-btn" onClick={() => publishChanges()}>
        Refresh the website now
      </button>
    </section>
  );
}
