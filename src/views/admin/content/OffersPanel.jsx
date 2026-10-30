'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { slugify } from '@/data/catalog';
import { deleteOffer, friendlyError, saveOffer } from '@/lib/cms-admin';
import { ConfirmButton, PhotoPicker, Thumb } from './PhotoTools';

function OfferEditor({ offer, content, me, canEdit, reload, onDone }) {
  const isNew = !offer.code;
  const [v, setV] = useState({ title: '', tag: '', text: '', image: '', room: '', type: 'stay', starts: '', ends: '', published: true, ...offer });
  const [inc, setInc] = useState((offer.includes || []).join('\n'));
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const code = isNew ? slugify(v.title).toUpperCase().replace(/-/g, '_').slice(0, 30) : offer.code;
  const save = async (e) => {
    e.preventDefault();
    setErr('');
    if (!v.title.trim()) return setErr('Give the offer a title.');
    if (!code) return setErr('Use letters or numbers in the title.');
    if (v.starts && v.ends && v.ends < v.starts) return setErr('The end date is before the start date.');
    if (isNew && content.offers.some((o) => o.code === code)) return setErr('An offer with this title already exists.');
    setBusy(true);
    try {
      await saveOffer(
        code,
        {
          title: v.title.trim().slice(0, 100),
          tag: v.tag.trim().slice(0, 40),
          text: v.text.trim().slice(0, 1000),
          includes: inc.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 12),
          image: v.image || '',
          room: v.room || '',
          type: v.type,
          starts: v.starts || '',
          ends: v.ends || '',
          order: offer.order ?? content.offers.length + 1,
          published: Boolean(v.published),
        },
        me
      );
      await reload();
      onDone(`${v.title.trim()} saved. The website is updated.`);
    } catch (x) {
      setErr(friendlyError(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel cm-editor" onSubmit={save}>
      <div className="cm-editor-head">
        <h2>{isNew ? 'Add an offer' : `Edit: ${offer.title}`}</h2>
        <button type="button" className="text-btn" onClick={() => onDone()}>
          ← Back to offers
        </button>
      </div>
      <fieldset disabled={!canEdit || busy} className="cm-fields">
        <div className="cm-grid">
          <label className="cm-field">
            <span className="lbl">Title *</span>
            <input className="cm-input" value={v.title} onChange={set('title')} maxLength={100} required />
          </label>
          <label className="cm-field">
            <span className="lbl">Tag on the photo</span>
            <input className="cm-input" value={v.tag} onChange={set('tag')} maxLength={40} placeholder="e.g. Couples" />
          </label>
          <label className="cm-field">
            <span className="lbl">Type</span>
            <select className="cm-input" value={v.type} onChange={set('type')}>
              <option value="stay">Stay</option>
              <option value="event">Event</option>
              <option value="meeting">Meeting</option>
              <option value="package">Package (stay + sightseeing)</option>
            </select>
          </label>
          <label className="cm-field">
            <span className="lbl">Suggested room</span>
            <select className="cm-input" value={v.room} onChange={set('room')}>
              <option value="">Any room</option>
              {content.rooms.map((r) => (
                <option key={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="cm-grid">
          <label className="cm-field">
            <span className="lbl">Show from (optional)</span>
            <input className="cm-input" type="date" value={v.starts} onChange={set('starts')} />
          </label>
          <label className="cm-field">
            <span className="lbl">Hide after (optional)</span>
            <input className="cm-input" type="date" value={v.ends} onChange={set('ends')} />
          </label>
        </div>
        <label className="cm-field">
          <span className="lbl">Description</span>
          <textarea className="cm-input" rows={3} value={v.text} onChange={set('text')} maxLength={1000} />
        </label>
        <label className="cm-field">
          <span className="lbl">What is included (one per line)</span>
          <textarea className="cm-input" rows={4} value={inc} onChange={(e) => setInc(e.target.value)} />
        </label>
        <div className="cm-field">
          <span className="lbl">Photo</span>
          <div className="cm-inline">
            <Thumb refKey={v.image} size="lg" />
            <button type="button" className="text-btn" onClick={() => setPicker(true)}>
              {v.image ? 'Change photo' : 'Choose photo'}
            </button>
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={v.published} onChange={set('published')} />
          <span>Show this offer on the website</span>
        </label>
        <p className="meta">Offers never show a price; guests ask for a rate with their dates. Publish only offers the hotel has agreed to.</p>
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
            {isNew ? 'Add offer' : 'Save changes'}
          </button>
        </div>
      )}
      <AnimatePresence>
        {picker && (
          <PhotoPicker
            media={content.media}
            me={me}
            onUploaded={reload}
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

export default function OffersPanel({ content, me, canEdit, reload }) {
  const [edit, setEdit] = useState(null);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  if (edit)
    return (
      <OfferEditor
        offer={edit}
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
  return (
    <section className="panel" aria-labelledby="off-h">
      <div className="cm-editor-head">
        <h2 id="off-h">Offers ({content.offers.length})</h2>
        {canEdit && (
          <button type="button" className="btn solid sm" onClick={() => setEdit({})}>
            ＋ Add offer
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
      {content.offers.length === 0 && <p className="meta">No offers. The Offers page asks guests to request a rate.</p>}
      <ul className="cm-list">
        {content.offers.map((o) => (
          <li key={o.code}>
            <Thumb refKey={o.image} />
            <div className="cm-list-main">
              <b>{o.title}</b>
              <span className="meta">
                {o.type || 'stay'} · code {o.code}
                {o.ends && ` · until ${o.ends}`}
                {o.published === false && <span className="pill st-Cancelled">Hidden</span>}
              </span>
            </div>
            <div className="cm-row-actions">
              <button type="button" className="text-btn" onClick={() => setEdit(o)}>
                {canEdit ? 'Edit' : 'Details'}
              </button>
              {canEdit && (
                <ConfirmButton
                  confirm={`Delete ${o.title}`}
                  onConfirm={async () => {
                    setErr('');
                    try {
                      await deleteOffer(o.code, me);
                      await reload();
                      setNote(`${o.title} deleted.`);
                    } catch (e) {
                      setErr(friendlyError(e));
                    }
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
