import Link from 'next/link';
import Photo from '../Photo';
import { Reveal } from './ui';

const meta = (r) => [r.size, r.guests ? `Up to ${r.guests} guests` : r.occupancy].filter(Boolean).join(' • ');

function Tile({ href, image, title, sub, i }) {
  return (
    <Reveal i={i} className="mosaic-tile">
      <Link href={href} className="mosaic-photo zoom-hover">
        <span className="frame">
          <Photo k={image} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 24vw" alt="" />
        </span>
        <span className="mosaic-cap">
          <b>{title}</b>
          <small>{sub}</small>
          <span className="mosaic-more" aria-hidden="true">
            View →
          </span>
        </span>
      </Link>
    </Reveal>
  );
}

const TOUR = { title: 'Room tour', meta: 'Watch the 73-second video', href: '/room-tour', image: 'tourPoster' };

// Grid of tall room photos with names over them, broken up by text tiles that introduce each group.
// Rooms and groups come from the admin panel.
export default function RoomMosaic({ rooms = [], categories = [] }) {
  let k = 0;
  const groups = categories.map((c) => ({ ...c, rooms: rooms.filter((r) => r.category === c.id) })).filter((g) => g.rooms.length);
  const rest = rooms.filter((r) => !categories.some((c) => c.id === r.category));
  if (rest.length) groups.push({ id: 'more', title: 'More rooms', text: 'Other room types at Hotel Sea View.', rooms: rest });
  return (
    <div className="mosaic">
      {groups.map((g, gi) => {
        const text = (
          <Reveal key={`${g.id}-text`} i={k++ % 4} className="mosaic-text">
            <h3>{g.title}</h3>
            {g.text && <p>{g.text}</p>}
          </Reveal>
        );
        const tiles = g.rooms.map((r) => <Tile key={r.id} i={k++ % 4} href={`/rooms/${r.id}`} image={r.images[0] || 'building'} title={r.name} sub={meta(r)} />);
        if (gi === groups.length - 1) tiles.push(<Tile key="tour" i={k++ % 4} href={TOUR.href} image={TOUR.image} title={TOUR.title} sub={TOUR.meta} />);
        return gi % 2 === 0 ? [text, ...tiles] : [...tiles, text];
      })}
    </div>
  );
}
