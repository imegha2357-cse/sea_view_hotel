import { useEffect, useState } from 'react';
import { fb } from '../../lib/firebase';
import { formatDate } from '../../lib/enquiry';

// Features #20, #58, #78: newsletter sign-ups, site feedback and front-end errors in one place.
function List({ name, title, render, canDelete, empty }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    const { db, F } = fb();
    const field = name === 'client_errors' ? 'at' : 'created_at';
    return F.onSnapshot(F.query(F.collection(db, name), F.orderBy(field, 'desc'), F.limit(100)), (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setErr('Could not load. Publish the latest firestore.rules.'));
  }, [name]);
  const remove = async (id) => {
    const { db, F } = fb();
    await F.deleteDoc(F.doc(db, name, id)).catch(() => {});
  };
  const copy = () => navigator.clipboard?.writeText((items || []).map((i) => i.email).join(', '));
  return (
    <section className="panel inbox" aria-label={title}>
      <h2>
        {title} {items && <small className="count">{items.length}</small>}
      </h2>
      {name === 'newsletter' && items?.length > 0 && (
        <button className="text-btn" onClick={copy}>
          Copy all emails
        </button>
      )}
      {err && <p className="form-alert">{err}</p>}
      {items?.length === 0 && <p className="meta">{empty}</p>}
      <ul>
        {items?.map((i) => (
          <li key={i.id}>
            <div>{render(i)}</div>
            {canDelete && (
              <button className="text-btn muted" onClick={() => remove(i.id)} aria-label="Remove">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Inbox({ canEdit }) {
  return (
    <div className="report-grid">
      <List
        name="feedback"
        title="Website feedback"
        canDelete={canEdit}
        empty="No feedback yet."
        render={(i) => (
          <>
            <p>{i.message}</p>
            <small className="meta">
              {i.page} · {formatDate(i.created_at)}
            </small>
          </>
        )}
      />
      <List
        name="newsletter"
        title="Offer sign-ups"
        canDelete={canEdit}
        empty="No one has signed up for offers yet."
        render={(i) => (
          <>
            <p>{i.email}</p>
            <small className="meta">Agreed {formatDate(i.created_at)}</small>
          </>
        )}
      />
      <List
        name="client_errors"
        title="Website errors"
        canDelete={canEdit}
        empty="No errors reported. Good."
        render={(i) => (
          <>
            <p className="mono">{i.message}</p>
            <small className="meta">
              {i.page} · {i.at?.toDate ? i.at.toDate().toLocaleString('en-IN') : ''}
            </small>
          </>
        )}
      />
    </div>
  );
}
