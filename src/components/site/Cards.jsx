import Link from 'next/link';
import Photo from '../Photo';
import { Chevron } from './ui';
import { slug } from '@/data/nav';

// Room card (Taj: photo with slow zoom on hover, caps title, short line, two actions).
export function RoomCard({ r }) {
  return (
    <article className="card zoom-hover">
      <Link href={`/rooms/${r.id}`} className="frame" tabIndex={-1} aria-hidden="true">
        <Photo k={r.image} sizes="(max-width: 640px) 84vw, (max-width: 1000px) 46vw, 30vw" alt="" />
      </Link>
      <div className="card-body">
        <span className="tag-line">{r.view}</span>
        <h3>
          <Link href={`/rooms/${r.id}`}>{r.name}</Link>
        </h3>
        <p>{r.summary}</p>
        <div className="card-meta">
          <span>{r.beds}</span>
          <span>Sleeps {r.occupancy}</span>
        </div>
        <div className="card-actions">
          <Link href={`/enquire?room_type=${encodeURIComponent(r.name)}`} className="btn solid sm">
            Book now
          </Link>
          <Link href={`/rooms/${r.id}`} className="more-link">
            Details <Chevron />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Overlay card: photo, gradient, title; the line of text rises in on hover or focus.
export function PlaceCard({ a, href }) {
  return (
    <Link href={href || `/experiences#${slug(a.name)}`} className="ocard zoom-hover">
      <span className="frame" style={{ position: 'absolute', inset: 0 }}>
        <Photo k={a.image} sizes="(max-width: 640px) 84vw, (max-width: 1000px) 46vw, 30vw" alt="" />
      </span>
      <span className="ocard-text">
        <h3>{a.name}</h3>
        <p>{a.text}</p>
      </span>
    </Link>
  );
}
