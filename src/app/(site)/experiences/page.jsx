import Link from 'next/link';
import { ATTRACTIONS, ITINERARIES } from '@/data/content';
import { slug } from '@/data/nav';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Split from '@/components/site/Split';
import Photo from '@/components/Photo';
import { Chevron, LineTitle, Reveal } from '@/components/site/ui';
import RequestLinks from '@/components/site/RequestLinks';

export const metadata = meta('/experiences');

export default function Experiences() {
  return (
    <>
      <PageTop slot="experiences" title="Experiences" text="The landmarks at the tip of India, with sightseeing from our travel desk." trail={[{ label: 'Experiences', href: '/experiences' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          {ATTRACTIONS.map((a, i) => (
            <Split key={a.name} id={slug(a.name)} images={[a.image]} tag="Kanyakumari" title={a.name} text={a.text} flip={i % 2 === 1} />
          ))}
        </div>
      </section>
      <section className="sec cream" id="travel-desk" aria-labelledby="desk-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="desk-h">Suggested plans</LineTitle>
            <p>Our travel desk arranges sightseeing and package tours. Ferry and monument timings change with the season, so ask us before you set out.</p>
          </div>
          <div className="itins">
            {ITINERARIES.map((it, i) => (
              <Reveal key={it.title} i={i} className="itin">
                {it.image && (
                  <div className="frame itin-photo zoom-hover">
                    <Photo k={it.image} sizes="(max-width: 900px) 100vw, 45vw" alt="" />
                  </div>
                )}
                <h3>{it.title}</h3>
                <ol>
                  {it.steps.map((s) => (
                    <li key={s.time}>
                      <b>{s.time}</b>
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            ))}
          </div>
          <p style={{ marginTop: 28 }}>
            <Link href="/plan-your-visit" className="more-link">
              Sunrise times, weather and how to reach us <Chevron />
            </Link>
          </p>
        </div>
      </section>
      <RequestLinks types={['tour', 'group', 'celebration']} />
    </>
  );
}
