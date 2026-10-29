'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Photo from '@/components/Photo';
import { EASE } from '@/components/Motion';
import { BUILT_IN, MAX_UPLOAD, friendlyError, preparePhoto, savePhoto } from '@/lib/cms-admin';

export const kb = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

// Small square preview of a photo reference (built-in key or uploaded 'm:<id>').
export function Thumb({ refKey, size = 'md', label }) {
  return (
    <span className={`frame cm-thumb ${size}`} title={label}>
      {refKey ? <Photo k={refKey} sizes="200px" alt="" /> : <span className="cm-thumb-none">No photo</span>}
    </span>
  );
}

// A delete (or other risky) button that asks "Are you sure?" in place instead of a browser pop-up.
export function ConfirmButton({ children, confirm = 'Yes, delete', onConfirm, disabled, className = 'text-btn danger' }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (!ask) return undefined;
    const t = setTimeout(() => setAsk(false), 6000);
    return () => clearTimeout(t);
  }, [ask]);
  if (!ask)
    return (
      <button type="button" className={className} disabled={disabled} onClick={() => setAsk(true)}>
        {children}
      </button>
    );
  return (
    <span className="cm-confirm" role="group" aria-label="Confirm">
      <button
        type="button"
        className="btn solid sm danger"
        onClick={() => {
          setAsk(false);
          onConfirm();
        }}
      >
        {confirm}
      </button>
      <button type="button" className="text-btn" onClick={() => setAsk(false)}>
        Cancel
      </button>
    </span>
  );
}

// Pick a file → see it compressed and previewed with its size → add a description → save.
export function PhotoUploader({ me, onSaved, compact = false, buttonLabel = 'Save photo' }) {
  const input = useRef(null);
  const [prep, setPrep] = useState(null);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // {ok, text}
  const [drag, setDrag] = useState(false);

  useEffect(() => () => prep?.preview && URL.revokeObjectURL(prep.preview), [prep]);

  const choose = async (file) => {
    setMsg(null);
    setPrep(null);
    if (!file) return;
    setBusy(true);
    try {
      const p = await preparePhoto(file);
      setPrep(p);
      setAlt(file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').slice(0, 120));
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const save = async () => {
    if (!prep) return;
    if (!alt.trim()) return setMsg({ ok: false, text: 'Add a short description of the photo (it is read out to blind visitors and helps Google).' });
    setBusy(true);
    setMsg(null);
    try {
      const ref = await savePhoto(prep, { alt: alt.trim() }, me);
      setPrep(null);
      setAlt('');
      setMsg({ ok: true, text: 'Photo saved.' });
      onSaved?.(ref);
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`cm-upload ${compact ? 'compact' : ''}`}>
      {!prep && (
        <label
          className={`cm-drop ${drag ? 'over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            choose(e.dataTransfer.files?.[0]);
          }}
        >
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => choose(e.target.files?.[0])} disabled={busy} />
          <span className="cm-drop-icon" aria-hidden="true">
            ＋
          </span>
          <b>{busy ? 'Preparing the photo…' : 'Choose a photo or drop it here'}</b>
          <small>JPG, PNG or WebP, up to {kb(MAX_UPLOAD)}. Large photos are resized to 2400 px and compressed automatically.</small>
        </label>
      )}
      {prep && (
        <div className="cm-preview">
          <div className="cm-preview-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={prep.preview} alt="Preview of the photo to upload" />
          </div>
          <div className="cm-preview-info">
            <p className="meta">
              {prep.name}
              <br />
              Original {prep.original.w}×{prep.original.h}, {kb(prep.original.size)} → saved as {prep.w}×{prep.h}, {kb(prep.size)} ({prep.mime.replace('image/', '').toUpperCase()})
            </p>
            {prep.warnings.map((w) => (
              <p key={w} className="cm-warn">
                {w}
              </p>
            ))}
            <label className="lbl" htmlFor="cm-alt">
              Describe the photo *
            </label>
            <input id="cm-alt" className="cm-input" value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Deluxe room with a sea-facing window" />
            <div className="form-actions">
              <button type="button" className="btn solid sm" onClick={save} disabled={busy}>
                {busy && <span className="spin" aria-hidden="true" />}
                {buttonLabel}
              </button>
              <button type="button" className="text-btn" onClick={() => setPrep(null)} disabled={busy}>
                Choose another
              </button>
            </div>
          </div>
        </div>
      )}
      {msg && (
        <p className={msg.ok ? 'cm-ok' : 'form-alert'} role={msg.ok ? 'status' : 'alert'}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// Window for choosing a photo: uploaded photos, the website's built-in photos, or a new upload.
export function PhotoPicker({ media, me, onPick, onClose, onUploaded, title = 'Choose a photo' }) {
  const [tab, setTab] = useState(media.length ? 'uploaded' : 'website');
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const list = tab === 'uploaded' ? media.map((m) => ({ ref: `m:${m.id}`, alt: m.alt || m.name })) : BUILT_IN;
  return (
    <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div className="drawer-bg" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="drawer cm-picker" data-lenis-prevent initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: EASE }}>
        <button ref={closeRef} className="x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>{title}</h2>
        <div className="cm-subtabs" role="tablist">
          {[
            ['uploaded', `Uploaded (${media.length})`],
            ['website', `Website photos (${BUILT_IN.length})`],
            ['upload', 'Upload new'],
          ].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'upload' ? (
          <PhotoUploader
            me={me}
            buttonLabel="Save and use this photo"
            onSaved={(ref) => {
              onUploaded?.();
              onPick(ref);
            }}
          />
        ) : list.length ? (
          <div className="cm-pick-grid">
            {list.map((p) => (
              <button key={p.ref} type="button" className="cm-pick" onClick={() => onPick(p.ref)} aria-label={`Use photo: ${p.alt || p.ref}`}>
                <Thumb refKey={p.ref} size="fill" />
                <span>{p.alt || p.ref}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="meta">No uploaded photos yet. Use “Upload new”.</p>
        )}
      </motion.aside>
    </div>
  );
}
