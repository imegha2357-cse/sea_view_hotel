import { REQUEST_FORMS } from '@/data/requests';

// A row of shortcuts to the request forms, used at the foot of related pages.
export default function RequestLinks({ types, title = 'More ways we can help' }) {
  return (
    <section className="sec req-strip" aria-label={title}>
      <div className="container wide">
        <h2 className="req-strip-h">{title}</h2>
        <ul role="list">
          {types.map((t) => (
            <li key={t}>
              <a href={`/request/${t}`}>
                <b>{REQUEST_FORMS[t].title}</b>
                <span>{REQUEST_FORMS[t].intro.split('. ')[0]}.</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
