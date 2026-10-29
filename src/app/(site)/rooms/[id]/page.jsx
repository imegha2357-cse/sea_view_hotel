import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RATE_NOTE, ROOMS } from '@/data/content';
import { meta } from '@/lib/meta';
import { JsonLd, roomLd } from '@/lib/ld';
import { rupees } from '@/lib/enquiry';
import { PHOTOS } from '@/data/images';
import PageTop from '@/components/site/PageTop';
import Rail from '@/components/site/Rail';
import { RoomCard } from '@/components/site/Cards';
import RoomActions from '@/components/site/RoomActions';
import RoomAmenities from '@/components/site/RoomAmenities';
import EnquiryForm from '@/components/EnquiryForm';
import { Chevron, LineTitle, Reveal } from '@/components/site/ui';
import Photo from '@/components/Photo';

export const dynamicParams = false;
export const generateStaticParams = () => ROOMS.map((r) => ({ id: r.id }));
export function generateMetadata({ params }) {
  const r = ROOMS.find((x) => x.id === params.id);
  return meta(`/rooms/${params.id}`, { image: r && PHOTOS[r.image].src });
}

const BASICS = ['Private bathroom', 'Television', 'Direct-dial phone', '24-hour room service'];

export default function RoomPage({ params }) {
  const r = ROOMS.find((x) => x.id === params.id);
  if (!r) notFound();
  const others = ROOMS.filter((x) => x.id !== r.id);
  return (
    <>
      <JsonLd data={roomLd(r.id)} />
      <PageTop image={r.image} title={r.name} text={r.view} trail={[{ label: 'Rooms', href: '/rooms' }, { label: r.name, href: `/rooms/${r.id}` }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide split">
          <Reveal className="frame zoom-hover">
            <Photo k={r.image} sizes="(max-width: 900px) 100vw, 55vw" />
          </Reveal>
          <Reveal className="split-copy" delay={0.1}>
            <span className="tag-line">{r.view}</span>
            <h2>{r.name}</h2>
            <p className="lead">{r.summary}</p>
            <dl className="info-list" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', display: 'grid' }}>
              <div>
                <dt>Beds</dt>
                <dd>{r.beds}</dd>
              </div>
              <div>
                <dt>Sleeps</dt>
                <dd>{r.occupancy}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{r.size || 'Please ask'}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{r.rate ? `From ${rupees(r.rate)} a night` : 'On enquiry'}</dd>
              </div>
            </dl>
            <RoomAmenities room={r} />
            <ul>
              {[...r.features, ...BASICS.filter((b) => !r.features.includes(b))].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="notice">{RATE_NOTE}</p>
            <RoomActions room={r} />
            <Link href="/room-tour" className="more-link">
              Watch the room tour video <Chevron />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="sec cream" id="book" aria-labelledby="book-h">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="sec-head">
            <LineTitle id="book-h">Ask about this room</LineTitle>
          </div>
          <EnquiryForm prefill={{ room_type: r.name }} />
        </div>
      </section>
      <section className="sec" aria-labelledby="other-h">
        <div className="container wide">
          <Rail label="rooms" title={<LineTitle id="other-h">Other rooms</LineTitle>}>
            {others.map((x) => (
              <RoomCard key={x.id} r={x} />
            ))}
          </Rail>
        </div>
      </section>
    </>
  );
}
