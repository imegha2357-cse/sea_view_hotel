import Link from 'next/link';
import { ROOM_GROUPS, ROOMS } from '@/data/content';
import Photo from '../Photo';
import { Reveal } from './ui';

const meta = (r) => [r.size, r.occupancy].filter(Boolean).join(' • ');

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

// Grid of tall room photos with names over them, broken up by text tiles that introduce each group.
export default function RoomMosaic() {
  let k = 0;
  return (
    <div className="mosaic">
      {ROOM_GROUPS.map((g) => {
        const text = (
          <Reveal key={`${g.title}-text`} i={k++ % 4} className="mosaic-text">
            <h3>{g.title}</h3>
            <p>{g.text}</p>
          </Reveal>
        );
        const tiles = g.rooms.map((id) => {
          const r = ROOMS.find((x) => x.id === id);
          return <Tile key={id} i={k++ % 4} href={`/rooms/${r.id}`} image={r.image} title={r.name} sub={meta(r)} />;
        });
        if (g.extra) tiles.push(<Tile key={g.extra.href} i={k++ % 4} href={g.extra.href} image={g.extra.image} title={g.extra.title} sub={g.extra.meta} />);
        return g.textFirst ? [text, ...tiles] : [...tiles, text];
      })}
    </div>
  );
}
