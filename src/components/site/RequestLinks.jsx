import { REQUEST_FORMS } from '@/data/requests';
import { WA_REQUESTS, waRequest } from '@/data/wa-requests';

// A row of shortcuts at the foot of related pages: forms on this site, or WhatsApp with a
// ready-made message (groups, corporate, gift a stay, call back).
export default function RequestLinks({ types, title = 'More ways we can help' }) {
  return (
    <section className="sec req-strip" aria-label={title}>
      <div className="container wide">
        <h2 className="req-strip-h">{title}</h2>
        <ul role="list">
          {types.map((t) => {
            const wa = WA_REQUESTS[t];
            const f = REQUEST_FORMS[t];
            if (!wa && !f) return null;
            return (
              <li key={t}>
                {wa ? (
                  <a href={waRequest(t)} target="_blank" rel="noopener noreferrer" className="req-wa">
                    <b>{wa.title}</b>
                    <span>{wa.text}</span>
                    <em>
                      <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
                        <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
                      </svg>
                      Chat on WhatsApp
                    </em>
                  </a>
                ) : (
                  <a href={`/request/${t}`}>
                    <b>{f.title}</b>
                    <span>{f.intro.split('. ')[0]}.</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
