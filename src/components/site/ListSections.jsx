import { getList, getSettings } from '@/lib/cms-server';
import { HOTEL } from '@/data/content';
import PhotoStrip from './PhotoStrip';
import Photo from '../Photo';
import { LineTitle, Reveal } from './ui';

const istToday = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const fmt = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Opening hours of nearby places and upcoming festivals (Website → Lists in the admin panel).
export async function LocalTimings() {
  const [timings, festivals] = await Promise.all([getList('timings'), getList('festivals')]);
  const today = istToday();
  const coming = festivals.filter((f) => (f.end || f.date) >= today).sort((a, b) => a.date.localeCompare(b.date));
  if (!timings.length && !coming.length) return null;
  return (
    <section className="sec" aria-label="Timings and festivals">
      <div className="container wide lt-grid">
        {timings.length > 0 && (
          <div>
            <LineTitle>Timings</LineTitle>
            <table className="lt-table">
              <tbody>
                {timings.map((t) => (
                  <tr key={t.place}>
                    <th scope="row">{t.place}</th>
                    <td>
                      {t.hours}
                      {t.note && <small>{t.note}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="meta">Timings can change on festival days and in rough seas. Our front desk can check for you.</p>
          </div>
        )}
        {coming.length > 0 && (
          <div>
            <LineTitle>Festivals and events</LineTitle>
            <ul className="fest-list" role="list">
              {coming.slice(0, 8).map((f, i) => (
                <Reveal as="li" key={`${f.name}-${f.date}`} i={i}>
                  <span className="fest-date">
                    {fmt(f.date)}
                    {f.end && f.end !== f.date && ` – ${fmt(f.end)}`}
                  </span>
                  <b>{f.name}</b>
                  {f.text && <p>{f.text}</p>}
                </Reveal>
              ))}
            </ul>
            <p>
              <a href="/enquire">Plan a stay around a festival</a>; rooms go quickly on these dates.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export async function Awards() {
  const awards = await getList('awards');
  if (!awards.length) return null;
  return (
    <section className="sec cream" aria-labelledby="awards-h">
      <div className="container wide">
        <LineTitle id="awards-h">Awards and recognition</LineTitle>
        <ul className="award-grid" role="list">
          {awards.map((a, i) => (
            <Reveal as="li" key={a.title} i={i % 4}>
              {a.image ? (
                <span className="frame award-img">
                  <Photo k={a.image} sizes="200px" alt="" fill />
                </span>
              ) : (
                <span className="award-medal" aria-hidden="true">
                  ★
                </span>
              )}
              <b>{a.title}</b>
              <span className="meta">{[a.by, a.year].filter(Boolean).join(', ')}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

// House rules from the admin panel plus check-in and check-out times from Settings.
export async function HousePolicies() {
  const [list, s] = await Promise.all([getList('policies'), getSettings()]);
  const checkIn = s.check_in || HOTEL.checkIn;
  const checkOut = s.check_out || HOTEL.checkOut;
  if (!list.length && !checkIn && !checkOut) return null;
  return (
    <section className="sec" style={{ paddingTop: 0 }} aria-labelledby="house-h">
      <div className="container wide">
        <LineTitle id="house-h">House rules</LineTitle>
        <div className="policy-grid">
          {(checkIn || checkOut) && (
            <div className="policy">
              <h3>Check-in and check-out</h3>
              <p>
                {checkIn && `Check-in from ${checkIn}. `}
                {checkOut && `Check-out by ${checkOut}.`} Early check-in and late check-out depend on availability; ask us.
              </p>
            </div>
          )}
          {list.map((p) => (
            <div key={p.title} className="policy">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function GuestPhotos() {
  const list = (await getList('guest_photos')).filter((p) => p.permission && p.image);
  if (!list.length) return null;
  return <PhotoStrip id="guest-photos" tone="cream" kicker="Shared by our guests" title="Through our guests' eyes" items={list.map((p) => ({ image: p.image, caption: [p.caption, p.by && `by ${p.by}`].filter(Boolean).join(', ') }))} />;
}
