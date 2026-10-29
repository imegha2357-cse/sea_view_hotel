import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RATE_NOTE } from '@/data/content';
import { meta } from '@/lib/meta';
import { JsonLd, roomLd } from '@/lib/ld';
import { rupees } from '@/lib/enquiry';
import { photo } from '@/data/images';
import { clip } from '@/data/routes';
import { getRoom, getRooms } from '@/lib/cms-server';
import PageTop from '@/components/site/PageTop';
import Rail from '@/components/site/Rail';
import { RoomCard } from '@/components/site/Cards';
import RoomActions from '@/components/site/RoomActions';
import RoomAmenities from '@/components/site/RoomAmenities';
import RoomGallery from '@/components/rooms/RoomGallery';
import RoomFacts from '@/components/rooms/RoomFacts';
import EnquiryForm from '@/components/EnquiryForm';
import { Chevron, LineTitle, Reveal } from '@/components/site/ui';

// Room pages come from the rooms managed in the admin panel. New rooms work straight away
// (built on first visit); deleted rooms show the "page not found" screen.
export const revalidate = 600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getRooms()).map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }) {
  const r = await getRoom(params.id);
  if (!r) return { title: { absolute: 'Room not found | Hotel Sea View' }, robots: { index: false } };
  const m = meta('/rooms', { image: photo(r.images[0])?.src });
  const title = `${r.name} | Hotel Sea View, Kanyakumari`;
  const description = clip([r.summary || r.description, r.view, r.occupancy && `Sleeps ${r.occupancy}.`].filter(Boolean).join(' ')) || m.description;
  const url = m.alternates.canonical.replace(/\/rooms$/, `/rooms/${r.id}`);
  return { ...m, title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { ...m.openGraph, url, title: r.name, description } };
}

export default async function RoomPage({ params }) {
  const r = await getRoom(params.id);
  if (!r) notFound();
  const others = (await getRooms()).filter((x) => x.id !== r.id);
  const paras = (r.description || r.summary || '').split(/\n{2,}/).filter(Boolean);
  return (
    <>
      <JsonLd data={roomLd(r)} />
      <PageTop image={r.images[0] || 'roomDeluxe'} title={r.name} text={r.view} trail={[{ label: 'Rooms', href: '/rooms' }, { label: r.name, href: `/rooms/${r.id}` }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide split room-split">
          <Reveal className="room-split-media">
            <RoomGallery room={r} />
          </Reveal>
          <Reveal className="split-copy" delay={0.1}>
            {r.view && <span className="tag-line">{r.view}</span>}
            <h2>{r.name}</h2>
            {paras.map((p, i) => (
              <p key={p.slice(0, 30)} className={i === 0 ? 'lead' : ''}>
                {p}
              </p>
            ))}
            <RoomFacts room={r} />
            <dl className="info-list" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', display: 'grid' }}>
              {r.occupancy && (
                <div>
                  <dt>Sleeps</dt>
                  <dd>{r.occupancy}</dd>
                </div>
              )}
              <div>
                <dt>Price</dt>
                <dd>{r.rate ? `From ${rupees(r.rate)} a night` : 'On enquiry'}</dd>
              </div>
            </dl>
            <RoomAmenities room={r} />
            {r.features.length > 0 && (
              <ul>
                {r.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
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
      {others.length > 0 && (
        <section className="sec" aria-labelledby="other-h">
          <div className="container wide">
            <Rail label="rooms" title={<LineTitle id="other-h">Other rooms</LineTitle>}>
              {others.map((x) => (
                <RoomCard key={x.id} r={x} />
              ))}
            </Rail>
          </div>
        </section>
      )}
    </>
  );
}
