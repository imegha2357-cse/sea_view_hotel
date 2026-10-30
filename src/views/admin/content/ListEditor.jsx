'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { friendlyError, loadList, saveList } from '@/lib/cms-admin';
import { PhotoPicker, Thumb } from './PhotoTools';

// One editor for every simple list on the website (menu, timings, festivals, reviews, awards,
// policies, guest photos). `fields` describes the columns; items are saved together.
// field: { key, label, type: 'text'|'textarea'|'select'|'checkbox'|'photo'|'date', options?, max?, required?, hint? }
export default function ListEditor({ id, title, help, fields, content, me, canEdit, reload, seed, itemLabel = 'item', max = 300 }) {
  const [items, setItems] = useState(null);
  const [orig, setOrig] = useState('[]');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [picker, setPicker] = useState(null); // { i, key }

  useEffect(() => {
    let off = false;
    loadList(id)
      .then((list) => {
        if (off) return;
        const start = list.length ? list : seed || [];
        setItems(start);
        setOrig(JSON.stringify(list));
      })
      .catch((e) => !off && setMsg({ ok: false, text: friendlyError(e) }));
    return () => {
      off = true;
    };
  }, [id, seed]);

  if (!items) return <section className="panel">{msg ? <p className="form-alert">{msg.text}</p> : 'Loading…'}</section>;
  const changed = JSON.stringify(items) !== orig;
  const upd = (i, k, v) => setItems((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i, d) =>
    setItems((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const a = [...l];
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? Boolean(f.default) : f.default ?? '']));

  const save = async () => {
    setMsg(null);
    for (const [n, it] of items.entries())
      for (const f of fields)
        if (f.required && (f.type === 'checkbox' ? !it[f.key] : !String(it[f.key] || '').trim())) return setMsg({ ok: false, text: `${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} ${n + 1}: ${f.label} is required.` });
    setBusy(true);
    try {
      const clean = items.map((it) => Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? Boolean(it[f.key]) : String(it[f.key] ?? '').slice(0, f.max || 600)])));
      await saveList(id, clean, me);
      setOrig(JSON.stringify(clean));
      setItems(clean);
      setMsg({ ok: true, text: 'Saved. The website is updated.' });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" aria-labelledby={`le-${id}`}>
      <div className="cm-editor-head">
        <h2 id={`le-${id}`}>
          {title} ({items.length})
        </h2>
        {canEdit && (
          <button type="button" className="btn solid sm" onClick={() => setItems((l) => [...l, blank()])} disabled={items.length >= max}>
            ＋ Add {itemLabel}
          </button>
        )}
      </div>
      {help && <p className="meta">{help}</p>}
      {seed && orig === '[]' && items.length > 0 && <p className="info-box">These are starting entries from the website. Check them and press Save to publish your own version.</p>}
      <ol className="le-list">
        {items.map((it, i) => (
          <li key={i} className="le-item">
            <div className="le-fields">
              {fields.map((f) => (
                <label key={f.key} className={`cm-field ${f.type === 'textarea' ? 'wide' : ''} ${f.type === 'checkbox' ? 'check' : ''}`}>
                  {f.type === 'checkbox' ? (
                    <>
                      <input type="checkbox" checked={Boolean(it[f.key])} onChange={(e) => upd(i, f.key, e.target.checked)} disabled={!canEdit} />
                      <span>{f.label}</span>
                    </>
                  ) : (
                    <>
                      <span className="lbl">
                        {f.label}
                        {f.required ? ' *' : ''}
                      </span>
                      {f.type === 'textarea' ? (
                        <textarea className="cm-input" rows={3} value={it[f.key] || ''} maxLength={f.max || 600} onChange={(e) => upd(i, f.key, e.target.value)} disabled={!canEdit} />
                      ) : f.type === 'select' ? (
                        <select className="cm-input" value={it[f.key] || ''} onChange={(e) => upd(i, f.key, e.target.value)} disabled={!canEdit}>
                          {f.options.map((o) => (
                            <option key={o} value={o}>
                              {o || '—'}
                            </option>
                          ))}
                        </select>
                      ) : f.type === 'photo' ? (
                        <span className="cm-inline">
                          <Thumb refKey={it[f.key]} />
                          {canEdit && (
                            <button type="button" className="text-btn" onClick={() => setPicker({ i, key: f.key })}>
                              {it[f.key] ? 'Change' : 'Choose photo'}
                            </button>
                          )}
                          {canEdit && it[f.key] && (
                            <button type="button" className="text-btn" onClick={() => upd(i, f.key, '')}>
                              Remove
                            </button>
                          )}
                        </span>
                      ) : (
                        <input className="cm-input" type={f.type === 'date' ? 'date' : 'text'} value={it[f.key] || ''} maxLength={f.max || 200} onChange={(e) => upd(i, f.key, e.target.value)} disabled={!canEdit} />
                      )}
                      {f.hint && <small className="meta">{f.hint}</small>}
                    </>
                  )}
                </label>
              ))}
            </div>
            {canEdit && (
              <div className="cm-row-actions">
                <button type="button" className="text-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  ↑
                </button>
                <button type="button" className="text-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                  ↓
                </button>
                <button type="button" className="text-btn danger" onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="meta">Nothing here yet. Nothing shows on the website until you add an {itemLabel}.</p>}
      {canEdit && (
        <div className="form-actions">
          <button type="button" className="btn solid sm" onClick={save} disabled={busy || (!changed && !(seed && orig === '[]'))}>
            {busy && <span className="spin" aria-hidden="true" />}
            Save {title.toLowerCase()}
          </button>
          {changed && (
            <button type="button" className="text-btn" onClick={() => setItems(JSON.parse(orig).length ? JSON.parse(orig) : seed || [])}>
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
        {picker && content && (
          <PhotoPicker
            media={content.media}
            me={me}
            onUploaded={reload}
            onClose={() => setPicker(null)}
            onPick={(ref) => {
              upd(picker.i, picker.key, ref);
              setPicker(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
