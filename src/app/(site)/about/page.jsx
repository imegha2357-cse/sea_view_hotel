import Link from 'next/link';
import { ABOUT, FACTS, HIGHLIGHT_SLIDES } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Highlights from '@/components/site/Highlights';
import Facilities from '@/components/site/Facilities';
import { Chevron, LineTitle, Reveal } from '@/components/site/ui';
import Photo from '@/components/Photo';

export const metadata = meta('/about');

export default function About() {
  return (
    <>
      <PageTop image="building" title="About the hotel" trail={[{ label: 'About', href: '/about' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide overview">
          <Reveal className="overview-copy">
            <LineTitle>{ABOUT.title}</LineTitle>
            {ABOUT.body.map((p) => (
              <p className="lead" key={p.slice(0, 20)}>
                {p}
              </p>
            ))}
            <div className="facts-row">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <b>{f.value}</b>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <Link href="/rooms" className="more-link">
              Our rooms <Chevron />
            </Link>
          </Reveal>
          <Reveal className="frame zoom-hover" delay={0.1}>
            <Photo k="lobby" sizes="(max-width: 900px) 100vw, 58vw" />
          </Reveal>
        </div>
      </section>
      <Highlights slides={HIGHLIGHT_SLIDES} title="What to expect" id="expect" />
      <section className="sec" aria-labelledby="fac-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="fac-h">Facilities</LineTitle>
          </div>
          <Facilities />
        </div>
      </section>
    </>
  );
}
