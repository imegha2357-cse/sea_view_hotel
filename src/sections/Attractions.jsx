import { ATTRACTIONS } from '../data/content';
import SmartImg from '../components/SmartImg';
import { Reveal, SectionHeading } from '../components/Motion';

// #49-style stagger + #82 hover reveal of the description
export default function Attractions() {
  return (
    <section className="section" id="nearby">
      <div className="container">
        <SectionHeading eyebrow="Around Kanyakumari" title="Places near the hotel" text="Our travel desk can arrange sightseeing and tours to all of these." />
        <div className="strip" tabIndex={0} aria-label="Nearby places, scroll sideways">
          {ATTRACTIONS.map((a, i) => (
            <Reveal key={a.name} i={i} className="place" as="article">
              <SmartImg name={a.image} />
              <div className="cap">
                <h3>{a.name}</h3>
                <p>{a.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
