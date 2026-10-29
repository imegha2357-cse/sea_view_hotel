import { Link } from 'react-router-dom';
import { FAQS, HOTEL, POLICIES } from '../data/content';
import { pageMeta } from '../data/routes';
import { usePageMeta } from '../lib/seo';
import { Eyebrow, Reveal, SplitWords } from '../components/Motion';

// Feature #29: house rules. Anything the hotel has not confirmed says "please ask" instead of guessing.
export default function Policies() {
  const meta = pageMeta('/policies');
  usePageMeta(meta.title, meta.description);
  return (
    <main id="main" className="page sub-page">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">Policies</span>
        </nav>
        <Eyebrow onMount>Good to know</Eyebrow>
        <SplitWords as="h1" text="Hotel policies" className="sub-title" onMount />
        <p className="sub-lead">The essentials before you arrive. If something is not covered here, call {HOTEL.phone} and we will answer.</p>
        <div className="policy-grid">
          {POLICIES.map((p, i) => (
            <Reveal key={p.title} i={i} className="policy">
              <h2>{p.title}</h2>
              <p>{p.text}</p>
              {!p.confirmed && <span className="tag muted">Ask the hotel</span>}
            </Reveal>
          ))}
        </div>
        <Reveal as="section" className="compare" aria-labelledby="pf-h">
          <h2 id="pf-h">Common questions</h2>
          <dl className="faq-plain">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </main>
  );
}
