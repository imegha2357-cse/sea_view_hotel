'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { BANNER_SLOTS, GALLERY_CATEGORIES, slugify } from '@/data/catalog';
import { HIGHLIGHT_SLIDES } from '@/data/content';

const HIGHLIGHT_SLOTS = HIGHLIGHT_SLIDES.map((h) => ({ id: slugify(h.title), label: h.title, fallback: h.image }));
import { friendlyError, saveSite } from '@/lib/cms-admin';
import { PhotoPicker, Thumb } from './PhotoTools';

const swap = (a, i, j) => {
  if (j < 0 || j >= a.length) return a;
  const b = [...a];
  [b[i], b[j]] = [b[j], b[i]];
  return b;
};

// One editable list of photos with a text field each (homepage slides, gallery).
function PhotoList({ id, title, help, items, max, field, fieldLabel, catField, content, me, canEdit, reload }) {
  const [list, setList] = useState(items);
  const [picker, setPicker] = useState(null); // {i} or {add:true}
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const changed = JSON.stringify(list) !== JSON.stringify(items);
  const upd = (i, k, val) => setList((l) => l.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const clean = list.filter((x) => x.image).map((x) => ({ image: x.image, [field]: String(x[field] || '').slice(0, 200), ...(catField ? { cat: x.cat || GALLERY_CATEGORIES[0] } : {}) }));
      await saveSite({ [id]: clean }, me);
      await reload();
      setMsg({ ok: true, text: 'Saved. The website is updated.' });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>
        {title} ({list.length}/{max})
      </h2>
      <p className="meta">{help}</p>
      <ol className="cm-photo-rows">
        {list.map((x, i) => (
          <li key={`${x.image}-${i}`}>
            <Thumb refKey={x.image} size="lg" />
            <div className="cm-media-main">
              <label className="lbl" htmlFor={`${id}-${i}`}>
                {fieldLabel}
              </label>
              <input id={`${id}-${i}`} className="cm-input" value={x[field] || ''} maxLength={200} onChange={(e) => upd(i, field, e.target.value)} disabled={!canEdit} />
              {catField && (
                <>
                  <label className="lbl" htmlFor={`${id}-c-${i}`}>
                    Category
                  </label>
                  <select id={`${id}-c-${i}`} className="cm-input" value={x.cat || GALLERY_CATEGORIES[0]} onChange={(e) => upd(i, 'cat', e.target.value)} disabled={!canEdit}>
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}
              {canEdit && (
                <div className="cm-row-actions">
                  <button type="button" className="text-btn" onClick={() => setList((l) => swap(l, i, i - 1))} disabled={i === 0}>
                    ↑ Earlier
                  </button>
                  <button type="button" className="text-btn" onClick={() => setList((l) => swap(l, i, i + 1))} disabled={i === list.length - 1}>
                    ↓ Later
                  </button>
                  <button type="button" className="text-btn" onClick={() => setPicker({ i })}>
                    Replace photo
                  </button>
                  <button type="button" className="text-btn danger" onClick={() => setList((l) => l.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {canEdit && (
        <div className="form-actions">
          <button type="button" className="text-btn" onClick={() => setPicker({ add: true })} disabled={list.length >= max}>
            ＋ Add photo
          </button>
          <button type="button" className="btn solid sm" onClick={save} disabled={!changed || busy}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save {title.toLowerCase()}
          </button>
          {changed && (
            <button type="button" className="text-btn" onClick={() => setList(items)}>
              Undo changes
            </button>
          )}
        </div>
      )}
      {msg && (
        <p className={msg.ok ? 'cm-ok' : 'form-alert'} role={msg.ok ? 'status' : 'alert'}>
          {msg.text}
        </p>
      )}
      <AnimatePresence>
        {picker && (
          <PhotoPicker
            media={content.media}
            me={me}
            onUploaded={reload}
            onClose={() => setPicker(null)}
            onPick={(ref) => {
              setList((l) => (picker.add ? [...l, { image: ref, [field]: '', ...(catField ? { cat: GALLERY_CATEGORIES[0] } : {}) }] : l.map((x, j) => (j === picker.i ? { ...x, image: ref } : x))));
              setPicker(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function SlotPhotos({ content, me, canEdit, reload, field = 'banners', slots = BANNER_SLOTS, title = 'Page banners', help = 'The large photo at the top of each page.' }) {
  const [picker, setPicker] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const banners = content.site[field] || {};
  const set = async (slot, ref) => {
    setBusy(slot);
    setMsg(null);
    try {
      const next = { ...banners };
      if (ref) next[slot] = ref;
      else delete next[slot];
      await saveSite({ [field]: next }, me);
      await reload();
      setMsg({ ok: true, text: 'Photo saved. The website is updated.' });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    } finally {
      setBusy('');
    }
  };
  return (
    <section className="panel" aria-labelledby={`${field}-h`}>
      <h2 id={`${field}-h`}>{title}</h2>
      <p className="meta">{help}</p>
      {msg && (
        <p className={msg.ok ? 'cm-ok' : 'form-alert'} role={msg.ok ? 'status' : 'alert'}>
          {msg.text}
        </p>
      )}
      <ul className="cm-banners">
        {slots.map((b) => (
          <li key={b.id}>
            <Thumb refKey={banners[b.id] || b.fallback} size="wide" />
            <b>{b.label}</b>
            <span className="meta">{banners[b.id] ? 'Custom photo' : 'Default photo'}</span>
            {canEdit && (
              <div className="cm-row-actions">
                <button type="button" className="text-btn" disabled={!!busy} onClick={() => setPicker(b.id)}>
                  {busy === b.id ? 'Saving…' : 'Change'}
                </button>
                {banners[b.id] && (
                  <button type="button" className="text-btn" disabled={!!busy} onClick={() => set(b.id, null)}>
                    Use default
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {picker && (
          <PhotoPicker
            media={content.media}
            me={me}
            onUploaded={reload}
            title={`${title}: ${slots.find((b) => b.id === picker)?.label}`}
            onClose={() => setPicker(null)}
            onPick={(ref) => {
              const slot = picker;
              setPicker(null);
              set(slot, ref);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default function HomePanel(props) {
  const { content } = props;
  return (
    <div className="cm-stack">
      <PhotoList
        key={`hero-${JSON.stringify(content.site.hero)}`}
        id="hero"
        title="Homepage slides"
        help="The large photos that change at the top of the homepage. The first slide loads first, so pick a strong one."
        items={content.site.hero}
        max={12}
        field="caption"
        fieldLabel="Description (read out to screen readers)"
        {...props}
      />
      <SlotPhotos {...props} />
      <SlotPhotos {...props} field="highlights" slots={HIGHLIGHT_SLOTS} title="Homepage highlights" help="The photo shown with each card in the homepage Highlights carousel." />
      <PhotoList
        key={`gal-${JSON.stringify(content.site.gallery)}`}
        id="gallery"
        title="Gallery"
        help="Photos on the Gallery page (and the first ten on the homepage). Visitors can filter them by category."
        items={content.site.gallery}
        max={120}
        field="alt"
        fieldLabel="Description"
        catField
        {...props}
      />
    </div>
  );
}
