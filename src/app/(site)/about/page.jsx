import Link from 'next/link';
import { ABOUT, FACTS, HIGHLIGHT_SLIDES } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Highlights from '@/components/site/Highlights';
import Facilities from '@/components/site/Facilities';
import PhotoStrip from '@/components/site/PhotoStrip';
import { Chevron, LineTitle, Reveal } from '@/components/site/ui';
import Photo from '@/components/Photo';
import { Awards } from '@/components/site/ListSections';
import ServiceBand from '@/components/site/ServiceBand';

export const revalidate = 600;

export const metadata = meta('/about');

export default function About() {
  return (
    <>
      <PageTop slot="about" title="About the hotel" trail={[{ label: 'About', href: '/about' }]} />
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
      <PhotoStrip
        id="inside"
        tone="cream"
        kicker="Around the hotel"
        title="Inside Hotel Sea View"
        items={[
          { image: 'frontNight', caption: 'The entrance porch at night' },
          { image: 'lounge', caption: 'Lounge' },
          { image: 'entranceDoors', caption: 'Entrance' },
          { image: 'roomCornerView', caption: 'The view from a corner room' },
          { image: 'dining', caption: 'Dining hall' },
          { image: 'lobbyEntrance', caption: 'Lobby' },
        ]}
      />
      <ServiceBand image="lobbyEntrance" alt="The lobby at Hotel Sea View" kicker="Hotel Sea View, Kanyakumari" title="A warm welcome at any hour" panelTitle="At your service" items={[['bell', '24-hour room service'], ['map', 'Sightseeing and taxis'], ['sun', 'Sunrise sea views'], ['car', 'Free parking']]} />
      <Highlights slides={HIGHLIGHT_SLIDES} title="What to expect" id="expect" />
      <section className="sec" aria-labelledby="fac-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="fac-h">Facilities</LineTitle>
          </div>
          <Facilities />
        </div>
      </section>
      <Awards />
    </>
  );
}
