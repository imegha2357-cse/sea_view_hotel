'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { deletePhoto, friendlyError, photoUsage, publishChanges, swapPhotoEverywhere, updatePhotoAlt } from '@/lib/cms-admin';
import { ConfirmButton, PhotoPicker, PhotoUploader, Thumb, kb } from './PhotoTools';

function MediaRow({ m, content, me, canEdit, reload, say }) {
  const ref = `m:${m.id}`;
  const used = photoUsage(ref, content);
  const [alt, setAlt] = useState(m.alt || '');
  const [busy, setBusy] = useState(false);
  const [replace, setReplace] = useState(false);

  const run = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      await reload();
      say({ ok: true, text: ok });
    } catch (e) {
      say({ ok: false, text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="cm-media">
      <a href={`/api/media/${m.id}`} target="_blank" rel="noreferrer" aria-label="Open the full-size photo">
        <Thumb refKey={ref} size="lg" />
      </a>
      <div className="cm-media-main">
        <label className="lbl" htmlFor={`alt-${m.id}`}>
          Description
        </label>
        <div className="cm-inline">
          <input id={`alt-${m.id}`} className="cm-input" value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} disabled={!canEdit || busy} />
          {canEdit && alt !== (m.alt || '') && (
            <button type="button" className="btn solid sm" disabled={busy || !alt.trim()} onClick={() => run(() => updatePhotoAlt(m.id, alt.trim()), 'Description saved.')}>
              Save
            </button>
          )}
        </div>
        <p className="meta">
          {m.w}×{m.h} · {kb(m.size)} · {used.length ? `Used in: ${used.join(', ')}` : 'Not used on the website yet'}
        </p>
        {canEdit && (
          <div className="cm-row-actions">
            <button type="button" className="text-btn" onClick={() => setReplace(true)} disabled={busy}>
              Replace everywhere
            </button>
            <ConfirmButton
              disabled={busy}
              confirm={used.length ? `Remove from ${used.length} place${used.length === 1 ? '' : 's'} and delete` : 'Yes, delete'}
              onConfirm={() =>
                run(async () => {
                  if (used.length) await swapPhotoEverywhere(ref, null, content, me);
                  await deletePhoto(m.id);
                  await publishChanges();
                }, used.length ? 'Photo removed from the website and deleted.' : 'Photo deleted.')
              }
            >
              Delete
            </ConfirmButton>
          </div>
        )}
      </div>
      <AnimatePresence>
        {replace && (
          <PhotoPicker
            media={content.media.filter((x) => x.id !== m.id)}
            me={me}
            onUploaded={reload}
            title="Replace this photo everywhere"
            onClose={() => setReplace(false)}
            onPick={(to) => {
              setReplace(false);
              run(async () => {
                await swapPhotoEverywhere(ref, to, content, me);
                await publishChanges();
              }, used.length ? `Replaced in ${used.length} place${used.length === 1 ? '' : 's'}. The old photo is still in the library; delete it if no longer needed.` : 'This photo was not used anywhere, so nothing changed on the website.');
            }}
          />
        )}
      </AnimatePresence>
    </li>
  );
}

export default function PhotosPanel({ content, me, canEdit, reload }) {
  const [msg, setMsg] = useState(null);
  return (
    <div className="cm-stack">
      {canEdit && (
        <section className="panel" aria-labelledby="up-h">
          <h2 id="up-h">Upload a photo</h2>
          <p className="meta">Uploaded photos go into the library below. Then add them to a room, an offer, the homepage slides, a page banner or the gallery.</p>
          <PhotoUploader
            me={me}
            onSaved={async () => {
              await reload();
              setMsg({ ok: true, text: 'Photo uploaded to the library.' });
            }}
          />
        </section>
      )}
      <section className="panel" aria-labelledby="lib-h">
        <h2 id="lib-h">Photo library ({content.media.length})</h2>
        {msg && (
          <p className={msg.ok ? 'cm-ok' : 'form-alert'} role={msg.ok ? 'status' : 'alert'}>
            {msg.text}
          </p>
        )}
        {content.media.length === 0 ? (
          <p className="meta">No uploaded photos yet. The website uses its built-in photos until you add your own.</p>
        ) : (
          <ul className="cm-media-list">
            {content.media.map((m) => (
              <MediaRow key={m.id} m={m} content={content} me={me} canEdit={canEdit} reload={reload} say={setMsg} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
