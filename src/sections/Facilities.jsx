import { FACILITIES } from '../data/content';
import { FacilityIcon } from '../components/Icons';
import { Reveal, SectionHeading } from '../components/Motion';

export default function Facilities() {
  return (
    <section className="section teal" id="facilities">
      <div className="container">
        <SectionHeading center eyebrow="Facilities" title="Everything for an easy stay" text="Only facilities the hotel offers today are listed here." />
        <div className="facilities">
          {FACILITIES.map((f, i) => (
            <Reveal key={f.label} i={i % 4} className="facility">
              <FacilityIcon name={f.icon} i={i % 4} />
              <span>{f.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
