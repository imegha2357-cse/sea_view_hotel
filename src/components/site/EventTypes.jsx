import Link from 'next/link';
import { EVENT_STEPS, EVENT_TYPES } from '@/data/content';
import { FacilityIcon } from '../Icons';
import { Reveal } from './ui';

// The kinds of events we host, as cards that lift and turn Deep Teal on hover, each opening a filled-in enquiry.
export function EventGrid({ limit }) {
  const list = limit ? EVENT_TYPES.slice(0, limit) : EVENT_TYPES;
  return (
    <div className="event-grid">
      {list.map((e, i) => (
        <Reveal key={e.id} i={i % 4} className="event-cell">
          <Link href={`/enquire?enquiry_type=${e.type}`} className="event-card" id={e.id}>
            <span className="feat-icon">
              <FacilityIcon name={e.icon} i={i % 4} />
            </span>
            <h3>{e.title}</h3>
            <p>{e.text}</p>
            <span className="feat-more" aria-hidden="true">
              Plan this event →
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function EventSteps() {
  return (
    <ol className="event-steps">
      {EVENT_STEPS.map((s, i) => (
        <Reveal as="li" key={s.title} i={i}>
          <b>{String(i + 1).padStart(2, '0')}</b>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
