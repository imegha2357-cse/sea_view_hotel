import Link from 'next/link';
import Photo from '../Photo';
import { Chevron } from './ui';

const enquireHref = (o) => {
  const q = new URLSearchParams({ promo_code: o.code });
  if (o.room) q.set('room_type', o.room);
  if (o.type) q.set('enquiry_type', o.type);
  return `/enquire?${q.toString()}`;
};

// Offer card: photo with a tag, title, short line, what's included, and an enquiry that carries the offer code.
export default function OfferCard({ o }) {
  return (
    <article className="offer zoom-hover">
      <div className="frame offer-img">
        <Photo k={o.image} sizes="(max-width: 640px) 84vw, (max-width: 1000px) 46vw, 30vw" alt="" />
        <span className="offer-tag">{o.tag}</span>
      </div>
      <div className="offer-body">
        <h3>{o.title}</h3>
        <p>{o.text}</p>
        <ul>
          {o.includes.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="offer-rate">Rate on request · confirmed with your dates</p>
        <div className="card-actions">
          <Link href={enquireHref(o)} className="btn solid sm">
            Check availability
          </Link>
          <Link href={`/offers#${o.code.toLowerCase()}`} className="more-link">
            Details <Chevron />
          </Link>
        </div>
      </div>
    </article>
  );
}
