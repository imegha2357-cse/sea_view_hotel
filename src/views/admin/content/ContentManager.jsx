'use client';

import { useCallback, useEffect, useState } from 'react';
import { friendlyError, importCurrentContent, loadContent } from '@/lib/cms-admin';
import RoomsPanel from './RoomsPanel';
import PhotosPanel from './PhotosPanel';
import HomePanel from './HomePanel';
import OffersPanel from './OffersPanel';

const SECTIONS = [
  ['rooms', 'Rooms'],
  ['photos', 'Photo library'],
  ['home', 'Slides, banners and gallery'],
  ['offers', 'Offers'],
];

// "Website" tab of the admin panel: everything guests see on the site, editable without code.
export default function ContentManager({ canEdit, me, section }) {
  const [content, setContent] = useState(null);
  const [err, setErr] = useState('');
  const [own, setSec] = useState('rooms');
  const sec = section || own;
  const [importing, setImporting] = useState(false);

  const reload = useCallback(async () => {
    try {
      setContent(await loadContent());
      setErr('');
    } catch (e) {
      setErr(friendlyError(e));
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  const doImport = async () => {
    setImporting(true);
    setErr('');
    try {
      await importCurrentContent(me);
      await reload();
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setImporting(false);
    }
  };

  if (err && !content)
    return (
      <div className="panel">
        <p className="form-alert" role="alert">
          {err}
        </p>
        <button className="btn outline" onClick={reload}>
          Try again
        </button>
      </div>
    );
  if (!content) return <div className="panel">Loading the website content…</div>;

  if (!content.seeded)
    return (
      <section className="panel cm-import" aria-labelledby="imp-h">
        <h2 id="imp-h">Start managing the website here</h2>
        <p>
          The website is showing its built-in rooms, offers and photos. Copy them into the database once, and from then on you can add, change and delete rooms, photos, slides, banners, the gallery and
          offers here, without any code.
        </p>
        <p className="meta">Nothing on the website changes when you do this. It copies 5 room types, the offers, the homepage slides and the gallery.</p>
        {canEdit ? (
          <button className="btn solid" onClick={doImport} disabled={importing}>
            {importing && <span className="spin" aria-hidden="true" />}
            Import the current website content
          </button>
        ) : (
          <p className="meta">Ask an owner or desk account to do this; view-only accounts cannot.</p>
        )}
        {err && (
          <p className="form-alert" role="alert">
            {err}
          </p>
        )}
      </section>
    );

  const props = { content, me, canEdit, reload };
  return (
    <div className="cm">
      {!section && (
      <nav className="cm-subtabs" aria-label="Website content">
        {SECTIONS.map(([id, label]) => (
          <button key={id} type="button" aria-current={sec === id ? 'page' : undefined} className={sec === id ? 'on' : ''} onClick={() => setSec(id)}>
            {label}
          </button>
        ))}
      </nav>
      )}
      {!canEdit && <p className="info-box">Your account is view-only, so you can look but not change anything.</p>}
      {err && (
        <p className="form-alert" role="alert">
          {err}
        </p>
      )}
      {sec === 'rooms' && <RoomsPanel {...props} />}
      {sec === 'photos' && <PhotosPanel {...props} />}
      {sec === 'home' && <HomePanel {...props} />}
      {sec === 'offers' && <OffersPanel {...props} />}
    </div>
  );
}
