import Link from 'next/link';
import { RATE_NOTE } from '@/data/content';
import { meta } from '@/lib/meta';
import { rupees } from '@/lib/enquiry';
import { getRooms, getSite } from '@/lib/cms-server';
import PageTop from '@/components/site/PageTop';
import RoomCarousel from '@/components/rooms/RoomCarousel';
import RecentRooms from '@/components/rooms/RecentRooms';
import { Chevron, Reveal } from '@/components/site/ui';

export const metadata = meta('/rooms');
export const revalidate = 600;

const ROWS = [
  ['View', (r) => r.view || '—'],
  ['Beds', (r) => r.beds || '—'],
  ['Guests', (r) => (r.guests ? `Up to ${r.guests}` : r.occupancy || '—')],
  ['Size', (r) => r.size || 'Please ask'],
  ['Price', (r) => (r.rate ? `From ${rupees(r.rate)} a night` : 'On enquiry')],
  ['Highlights', (r) => (r.features?.length ? r.features.join(', ') : '—')],
];

// Rooms and suites, laid out like Taj Lands End: a centred title between rules for each group,
// a short introduction, then a carousel of room cards.
export default async function RoomsPage() {
  const [rooms, site] = await Promise.all([getRooms(), getSite()]);
  const groups = site.categories.map((c) => ({ ...c, rooms: rooms.filter((r) => r.category === c.id) })).filter((g) => g.rooms.length);
  const rest = rooms.filter((r) => !site.categories.some((c) => c.id === r.category));
  if (rest.length) groups.push({ id: 'more', title: groups.length ? 'More rooms' : 'Rooms', text: '', rooms: rest });

  return (
    <>
      <PageTop slot="rooms" title="Rooms and suites" trail={[{ label: 'Rooms', href: '/rooms' }]} />
      <section className="sec rooms-intro" style={{ paddingTop: 24 }}>
        <div className="container">
          <Reveal className="rule-title">
            <h2>Rooms and suites</h2>
          </Reveal>
          <p className="rule-intro">Wake up to the sunrise over the sea where three oceans meet, or stay on the quieter town side. {RATE_NOTE}</p>
          {groups.length > 1 && (
            <nav className="rule-jump" aria-label="Room groups">
              {groups.map((g) => (
                <a key={g.id} href={`#${g.id}`}>
                  {g.title}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      {groups.length === 0 && (
        <section className="sec">
          <div className="container">
            <p className="empty-note">Room details are being updated. Please call or WhatsApp us for availability.</p>
          </div>
        </section>
      )}

      {groups.map((g, i) => (
        <section key={g.id} id={g.id} className={`sec rooms-group ${i % 2 ? 'cream' : ''}`} aria-labelledby={`${g.id}-h`}>
          <div className="container">
            <div className="rule-title sm">
              <h2 id={`${g.id}-h`}>{g.title}</h2>
            </div>
            {g.text && <p className="rule-intro">{g.text}</p>}
          </div>
          <RoomCarousel rooms={g.rooms} label={g.title} />
        </section>
      ))}

      <section className="sec" aria-labelledby="tour-h">
        <div className="container rooms-tour">
          <h2 id="tour-h">See the rooms on video</h2>
          <p>A 73-second walk through the corridor, a deluxe room and the balcony view of the sea.</p>
          <Link href="/room-tour" className="more-link">
            Watch the room tour <Chevron />
          </Link>
        </div>
      </section>

      {rooms.length > 1 && (
        <section className="sec cream" aria-labelledby="compare-h">
          <div className="container wide">
            <div className="rule-title sm">
              <h2 id="compare-h">Compare rooms</h2>
            </div>
            <p className="rule-intro">
              <Link href="/rooms/compare">Pick rooms to compare</Link> · <Link href="/room-finder">Help me choose a room</Link>
            </p>
            <Reveal className="table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Feature</span>
                    </th>
                    {rooms.map((r) => (
                      <th key={r.id} scope="col">
                        <Link href={`/rooms/${r.id}`}>{r.name}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([label, get]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {rooms.map((r) => (
                        <td key={r.id}>{get(r)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>
      )}
      <RecentRooms />
    </>
  );
}
