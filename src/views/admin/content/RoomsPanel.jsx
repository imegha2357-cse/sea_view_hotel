'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AMENITY_CATALOG, slugify } from '@/data/catalog';
import { deleteRoom, friendlyError, saveRoom, saveSite } from '@/lib/cms-admin';
import { ConfirmButton, PhotoPicker, Thumb } from './PhotoTools';

const EMPTY = { name: '', category: '', summary: '', description: '', view: '', beds: '', occupancy: '', guests: 2, size: '', rate: '', features: [], amenities: ['bathroom', 'tv', 'phone', 'room_service'], images: [], published: true };

function RoomEditor({ room, content, me, canEdit, onDone, reload }) {
  const isNew = !room.id;
  const [v, setV] = useState({ ...EMPTY, ...room, rate: room.rate ?? '', features: room.features || [], images: room.images || [], amenities: room.amenities || [] });
  const [featureText, setFeatureText] = useState((room.features || []).join('\n'));
  const [picker, setPicker] = useState(null); // null | {mode:'add'} | {mode:'replace', i}
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const id = isNew ? slugify(v.name) : room.id;
  const taken = isNew && content.rooms.some((r) => r.id === id);

  const moveImg = (i, d) =>
    setV((x) => {
      const a = [...x.images];
      const j = i + d;
      if (j < 0 || j >= a.length) return x;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...x, images: a };
    });

  const save = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!v.name.trim()) return setMsg({ ok: false, text: 'Give the room type a name.' });
    if (!id) return setMsg({ ok: false, text: 'Use letters or numbers in the name.' });
    if (taken) return setMsg({ ok: false, text: 'A room type with this name already exists. Choose a different name.' });
    const rate = v.rate === '' ? null : Number(v.rate);
    if (rate !== null && (!Number.isFinite(rate) || rate < 0)) return setMsg({ ok: false, text: 'The price must be a number, or left empty for “on enquiry”.' });
    const guests = Number(v.guests) || null;
    setBusy(true);
    try {
      const data = {
        name: v.name.trim().slice(0, 80),
        category: v.category || '',
        summary: v.summary.trim().slice(0, 400),
        description: v.description.trim().slice(0, 4000),
        view: v.view.trim().slice(0, 80),
        beds: v.beds.trim().slice(0, 80),
        occupancy: v.occupancy.trim().slice(0, 80),
        guests: guests && Math.min(50, Math.max(1, Math.round(guests))),
        size: v.size.trim().slice(0, 40),
        rate: rate === null ? null : Math.round(rate),
        features: featureText.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 20),
        amenities: v.amenities.slice(0, 40),
        images: v.images.slice(0, 20),
        order: room.order ?? content.rooms.length + 1,
        published: Boolean(v.published),
      };
      await saveRoom(id, data, me);
      await reload();
      onDone(`${data.name} saved. The website is updated.`);
    } catch (err) {
      setMsg({ ok: false, text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel cm-editor" onSubmit={save}>
      <div className="cm-editor-head">
        <h2>{isNew ? 'Add a room type' : `Edit: ${room.name}`}</h2>
        <button type="button" className="text-btn" onClick={() => onDone()}>
          ← Back to rooms
        </button>
      </div>
      <fieldset disabled={!canEdit || busy} className="cm-fields">
        <div className="cm-grid">
          <label className="cm-field">
            <span className="lbl">Name *</span>
            <input className="cm-input" value={v.name} onChange={set('name')} maxLength={80} required />
            {isNew && v.name && <small className="meta">Page address: /rooms/{id || '…'}</small>}
          </label>
          <label className="cm-field">
            <span className="lbl">Group</span>
            <select className="cm-input" value={v.category} onChange={set('category')}>
              <option value="">No group</option>
              {content.site.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="cm-field">
            <span className="lbl">View</span>
            <input className="cm-input" value={v.view} onChange={set('view')} maxLength={80} placeholder="e.g. Sea view facing the sunrise" />
          </label>
          <label className="cm-field">
            <span className="lbl">Beds</span>
            <input className="cm-input" value={v.beds} onChange={set('beds')} maxLength={80} placeholder="e.g. King bed or twin beds" />
          </label>
          <label className="cm-field">
            <span className="lbl">Sleeps (in words)</span>
            <input className="cm-input" value={v.occupancy} onChange={set('occupancy')} maxLength={80} placeholder="e.g. 2 adults and 1 child" />
          </label>
          <label className="cm-field">
            <span className="lbl">Up to how many guests</span>
            <input className="cm-input" type="number" min="1" max="50" value={v.guests ?? ''} onChange={set('guests')} />
          </label>
          <label className="cm-field">
            <span className="lbl">Size</span>
            <input className="cm-input" value={v.size} onChange={set('size')} maxLength={40} placeholder="e.g. 28 sq m (leave empty if unsure)" />
          </label>
          <label className="cm-field">
            <span className="lbl">Price from, ₹ a night</span>
            <input className="cm-input" type="number" min="0" step="1" value={v.rate} onChange={set('rate')} placeholder="Empty = on enquiry" />
          </label>
        </div>
        <label className="cm-field">
          <span className="lbl">Short line (shown on cards)</span>
          <textarea className="cm-input" rows={2} value={v.summary} onChange={set('summary')} maxLength={400} />
          <small className="meta">{v.summary.length}/400</small>
        </label>
        <label className="cm-field">
          <span className="lbl">Full description (shown in “More” and on the room page; leave a blank line between paragraphs)</span>
          <textarea className="cm-input" rows={6} value={v.description} onChange={set('description')} maxLength={4000} />
        </label>
        <label className="cm-field">
          <span className="lbl">Highlights (one per line)</span>
          <textarea className="cm-input" rows={4} value={featureText} onChange={(e) => setFeatureText(e.target.value)} />
        </label>
        <fieldset className="cm-amen">
          <legend className="lbl">Services and amenities</legend>
          {AMENITY_CATALOG.map((a) => (
            <label key={a.id} className="check">
              <input
                type="checkbox"
                checked={v.amenities.includes(a.id)}
                onChange={(e) => setV((x) => ({ ...x, amenities: e.target.checked ? [...x.amenities, a.id] : x.amenities.filter((y) => y !== a.id) }))}
              />
              <span>{a.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="cm-field">
          <span className="lbl">Photos ({v.images.length}/20). The first photo is the main one.</span>
          <ol className="cm-imgs">
            {v.images.map((ref, i) => (
              <li key={`${ref}-${i}`}>
                <Thumb refKey={ref} size="lg" />
                <div className="cm-img-actions">
                  <button type="button" className="text-btn" onClick={() => moveImg(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`}>
                    ←
                  </button>
                  <button type="button" className="text-btn" onClick={() => moveImg(i, 1)} disabled={i === v.images.length - 1} aria-label={`Move photo ${i + 1} later`}>
                    →
                  </button>
                  <button type="button" className="text-btn" onClick={() => setPicker({ mode: 'replace', i })}>
                    Replace
                  </button>
                  <button type="button" className="text-btn danger" onClick={() => setV((x) => ({ ...x, images: x.images.filter((_, k) => k !== i) }))}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {v.images.length < 20 && (
              <li>
                <button type="button" className="cm-add-img" onClick={() => setPicker({ mode: 'add' })}>
                  ＋ Add photo
                </button>
              </li>
            )}
          </ol>
        </div>
        <label className="check">
          <input type="checkbox" checked={v.published} onChange={set('published')} />
          <span>Show this room type on the website</span>
        </label>
      </fieldset>
      {msg && (
        <p className={msg.ok ? 'cm-ok' : 'form-alert'} role="alert">
          {msg.text}
        </p>
      )}
      {canEdit && (
        <div className="form-actions">
          <button className="btn solid" disabled={busy}>
            {busy && <span className="spin" aria-hidden="true" />}
            {isNew ? 'Add room type' : 'Save changes'}
          </button>
          <button type="button" className="text-btn" onClick={() => onDone()} disabled={busy}>
            Cancel
          </button>
        </div>
      )}
      <AnimatePresence>
        {picker && (
          <PhotoPicker
            media={content.media}
            me={me}
            onUploaded={reload}
            onClose={() => setPicker(null)}
            title={picker.mode === 'replace' ? 'Replace this photo' : 'Add a photo to this room'}
            onPick={(ref) => {
              setV((x) => ({ ...x, images: picker.mode === 'replace' ? x.images.map((r, k) => (k === picker.i ? ref : r)) : [...x.images, ref] }));
              setPicker(null);
            }}
          />
        )}
      </AnimatePresence>
    </form>
  );
}

function Categories({ content, me, canEdit, reload, setNote }) {
  const [list, setList] = useState(content.site.categories);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const changed = JSON.stringify(list) !== JSON.stringify(content.site.categories);
  const used = (id) => content.rooms.filter((r) => r.category === id).length;
  const upd = (i, k, val) => setList((l) => l.map((c, j) => (j === i ? { ...c, [k]: val } : c)));
  const save = async () => {
    setErr('');
    const clean = list.map((c) => ({ id: c.id || slugify(c.title), title: c.title.trim().slice(0, 80), text: (c.text || '').trim().slice(0, 600) }));
    if (clean.some((c) => !c.title || !c.id)) return setErr('Every group needs a title.');
    if (new Set(clean.map((c) => c.id)).size !== clean.length) return setErr('Two groups have the same title.');
    setBusy(true);
    try {
      await saveSite({ categories: clean }, me);
      await reload();
      setNote('Room groups saved.');
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel" aria-labelledby="cats-h">
      <h2 id="cats-h">Room groups</h2>
      <p className="meta">Groups split the rooms page into sections, each with its own title and introduction (like “Sea-view rooms”).</p>
      <ol className="cm-cats">
        {list.map((c, i) => (
          <li key={c.id || `new-${i}`}>
            <input className="cm-input" aria-label="Group title" value={c.title} maxLength={80} onChange={(e) => upd(i, 'title', e.target.value)} disabled={!canEdit} />
            <textarea className="cm-input" aria-label="Group introduction" rows={2} value={c.text || ''} maxLength={600} onChange={(e) => upd(i, 'text', e.target.value)} disabled={!canEdit} />
            {canEdit && (
              <div className="cm-row-actions">
                <button type="button" className="text-btn" disabled={i === 0} onClick={() => setList((l) => { const a = [...l]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; })}>
                  Move up
                </button>
                {used(c.id) ? (
                  <span className="meta">{used(c.id)} room type(s) in this group</span>
                ) : (
                  <button type="button" className="text-btn danger" onClick={() => setList((l) => l.filter((_, j) => j !== i))}>
                    Remove group
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
      {canEdit && (
        <div className="form-actions">
          <button type="button" className="text-btn" onClick={() => setList((l) => [...l, { id: '', title: '', text: '' }])} disabled={list.length >= 12}>
            ＋ Add group
          </button>
          <button type="button" className="btn solid sm" onClick={save} disabled={!changed || busy}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save groups
          </button>
        </div>
      )}
      {err && (
        <p className="form-alert" role="alert">
          {err}
        </p>
      )}
    </section>
  );
}

export default function RoomsPanel({ content, me, canEdit, reload }) {
  const [edit, setEdit] = useState(null);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const cat = (id) => content.site.categories.find((c) => c.id === id)?.title || 'No group';

  if (edit)
    return (
      <RoomEditor
        room={edit}
        content={content}
        me={me}
        canEdit={canEdit}
        reload={reload}
        onDone={(m) => {
          setEdit(null);
          if (m) setNote(m);
        }}
      />
    );

  const move = async (i, d) => {
    const a = [...content.rooms];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    setBusy('order');
    try {
      await Promise.all(a.map((r, k) => (r.order === k + 1 ? null : saveRoom(r.id, { ...r, order: k + 1 }, me))));
      await reload();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy('');
    }
  };

  const remove = async (r) => {
    setErr('');
    setBusy(r.id);
    try {
      await deleteRoom(r.id);
      await reload();
      setNote(`${r.name} deleted. Its page now shows “not found” and it is gone from menus and lists.`);
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="cm-stack">
      <section className="panel" aria-labelledby="rooms-h">
        <div className="cm-editor-head">
          <h2 id="rooms-h">Room types ({content.rooms.length})</h2>
          {canEdit && (
            <button type="button" className="btn solid sm" onClick={() => setEdit({ category: content.site.categories[0]?.id || '' })}>
              ＋ Add room type
            </button>
          )}
        </div>
        {note && (
          <p className="cm-ok" role="status">
            {note}
          </p>
        )}
        {err && (
          <p className="form-alert" role="alert">
            {err}
          </p>
        )}
        {content.rooms.length === 0 && <p className="meta">No room types yet. Add the first one.</p>}
        <ul className="cm-list">
          {content.rooms.map((r, i) => (
            <li key={r.id}>
              <Thumb refKey={r.images?.[0]} />
              <div className="cm-list-main">
                <b>{r.name}</b>
                <span className="meta">
                  {cat(r.category)} · {r.images?.length || 0} photo{r.images?.length === 1 ? '' : 's'} · {r.rate ? `from ₹${r.rate}` : 'price on enquiry'}
                  {r.published === false && <span className="pill st-Cancelled">Hidden</span>}
                </span>
              </div>
              <div className="cm-row-actions">
                {canEdit && (
                  <>
                    <button type="button" className="text-btn" onClick={() => move(i, -1)} disabled={i === 0 || !!busy} aria-label={`Move ${r.name} up`}>
                      ↑
                    </button>
                    <button type="button" className="text-btn" onClick={() => move(i, 1)} disabled={i === content.rooms.length - 1 || !!busy} aria-label={`Move ${r.name} down`}>
                      ↓
                    </button>
                  </>
                )}
                <a className="text-btn" href={`/rooms/${r.id}`} target="_blank" rel="noreferrer">
                  View
                </a>
                <button type="button" className="text-btn" onClick={() => setEdit(r)}>
                  {canEdit ? 'Edit' : 'Details'}
                </button>
                {canEdit && (
                  <ConfirmButton onConfirm={() => remove(r)} disabled={!!busy} confirm={`Delete ${r.name}`}>
                    Delete
                  </ConfirmButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Categories key={JSON.stringify(content.site.categories)} content={content} me={me} canEdit={canEdit} reload={reload} setNote={setNote} />
    </div>
  );
}
