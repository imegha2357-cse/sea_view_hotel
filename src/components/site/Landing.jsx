import Link from 'next/link';
import { HOTEL } from '@/data/content';
import { getRooms } from '@/lib/cms-server';
import { waLink } from '@/lib/enquiry';
import PageTop from './PageTop';
import PhotoStrip from './PhotoStrip';
import { RoomCard } from './Cards';
import Rail from './Rail';
import { LineTitle } from './ui';

// Focused landing pages (local search topics and the Tamil, Hindi and Malayalam pages).
// `copy` holds the words; only facts the hotel has published are used.
export default async function Landing({ path, copy, lang, photos, roomFilter }) {
  const rooms = (await getRooms()).filter(roomFilter || (() => true));
  return (
    <div lang={lang}>
      <PageTop image={photos[0].image} title={copy.title} text={copy.lead} trail={[{ label: copy.crumb || copy.title, href: path }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container landing">
          {copy.sections.map(([h, p]) => (
            <div key={h} className="landing-sec">
              <h2>{h}</h2>
              <p>{p}</p>
            </div>
          ))}
          <div className="card-actions">
            <Link href="/enquire" className="btn solid">
              {copy.cta}
            </Link>
            <a className="btn outline" href={waLink(copy.wa || 'Hello Hotel Sea View, ')} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a className="btn outline" href={`tel:${HOTEL.phoneHref}`}>
              {HOTEL.phone}
            </a>
          </div>
        </div>
      </section>
      {rooms.length > 0 && (
        <section className="sec cream" aria-labelledby="land-rooms">
          <div className="container wide">
            <Rail label="rooms" title={<LineTitle id="land-rooms">{copy.roomsTitle || 'Rooms'}</LineTitle>}>
              {rooms.map((r) => (
                <RoomCard key={r.id} r={r} />
              ))}
            </Rail>
          </div>
        </section>
      )}
      <PhotoStrip id="land-photos" items={photos} />
    </div>
  );
}
