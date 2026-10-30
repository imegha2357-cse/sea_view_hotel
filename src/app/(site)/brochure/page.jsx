import { ABOUT, HOTEL } from '@/data/content';
import { SITE_URL } from '@/data/site';
import { meta } from '@/lib/meta';
import { getRooms } from '@/lib/cms-server';
import Photo from '@/components/Photo';
import PrintButton from '@/components/site/PrintButton';

export const metadata = meta('/brochure');
export const revalidate = 600;

// One-page brochure: print it, or save it as a PDF from the print dialog.
export default async function Brochure() {
  const rooms = await getRooms();
  return (
    <section className="sec brochure-wrap">
      <div className="container">
        <p className="no-print">
          <PrintButton /> Print it or choose "Save as PDF" in the print window.
        </p>
        <article className="brochure">
          <header>
            <img src="/brand/wordmark-dark.png" alt="Hotel Sea View" width={220} height={60} />
            <p>{HOTEL.addressLines.join(', ')}</p>
          </header>
          <div className="br-hero">
            <Photo k="roomCornerView" sizes="800px" alt="" />
          </div>
          <h1>{ABOUT.title}</h1>
          {ABOUT.body.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
          <div className="br-cols">
            <div>
              <h2>Rooms</h2>
              <ul>
                {rooms.map((r) => (
                  <li key={r.id}>
                    <b>{r.name}</b>
                    {r.view && ` · ${r.view}`}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2>At the hotel</h2>
              <ul>
                {ABOUT.highlights.map((h) => (
                  <li key={h.title}>
                    <b>{h.title}</b>: {h.text}
                  </li>
                ))}
                <li>
                  <b>Dining</b>: Sea View Restaurant and the Wave Bar
                </li>
                <li>
                  <b>Events</b>: conference hall for meetings and family functions
                </li>
              </ul>
            </div>
          </div>
          <div className="br-photos">
            {['building', 'restaurant1', 'lounge', 'meeting'].map((k) => (
              <span key={k} className="frame">
                <Photo k={k} sizes="200px" alt="" />
              </span>
            ))}
          </div>
          <footer>
            <p>
              <b>Phone / WhatsApp</b> {HOTEL.phone} · <b>Restaurant</b> {HOTEL.restaurantPhone} · <b>Email</b> {HOTEL.email}
            </p>
            <p>{SITE_URL.replace(/^https?:\/\//, '')}</p>
          </footer>
        </article>
      </div>
    </section>
  );
}
