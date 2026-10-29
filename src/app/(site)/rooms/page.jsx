import Link from 'next/link';
import { RATE_NOTE, ROOMS } from '@/data/content';
import { meta } from '@/lib/meta';
import { rupees } from '@/lib/enquiry';
import PageTop from '@/components/site/PageTop';
import RoomMosaic from '@/components/site/RoomMosaic';
import { LineTitle, Reveal } from '@/components/site/ui';

export const metadata = meta('/rooms');

const ROWS = [
  ['View', (r) => r.view],
  ['Beds', (r) => r.beds],
  ['Sleeps', (r) => r.occupancy],
  ['Size', (r) => r.size || 'Please ask'],
  ['Price', (r) => (r.rate ? `From ${rupees(r.rate)} a night` : 'On enquiry')],
  ['Highlights', (r) => r.features.join(', ')],
];

export default function RoomsPage() {
  return (
    <>
      <PageTop image="roomDeluxe" title="Rooms and suites" trail={[{ label: 'Rooms', href: '/rooms' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <div className="sec-head">
            <LineTitle as="h2">Rooms</LineTitle>
            <p>Every room has a private bathroom, television and direct-dial phone, with room service around the clock. {RATE_NOTE}</p>
          </div>
          <RoomMosaic />
        </div>
      </section>
      <section className="sec cream" aria-labelledby="compare-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="compare-h">Compare rooms</LineTitle>
          </div>
          <Reveal className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Feature</span>
                  </th>
                  {ROOMS.map((r) => (
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
                    {ROOMS.map((r) => (
                      <td key={r.id}>{get(r)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>
    </>
  );
}
