import { HOTEL } from '../data/content';
import EnquiryForm from '../components/EnquiryForm';
import { Eyebrow, MaskLines, Reveal } from '../components/Motion';

export default function Enquire({ prefill }) {
  return (
    <section className="section teal" id="enquire">
      <div className="container enquiry">
        <div className="enquiry-aside">
          <Eyebrow>Plan your stay</Eyebrow>
          <MaskLines lines={['Send us', 'an enquiry']} />
          <Reveal as="p" delay={0.2}>
            Tell us your dates and we will reply with availability and the best rate for your stay, usually the same day.
          </Reveal>
          <Reveal className="contact-lines" delay={0.3}>
            <a href={`tel:${HOTEL.phoneHref}`}>Call {HOTEL.phone}</a>
            <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <EnquiryForm prefill={prefill} />
        </Reveal>
      </div>
    </section>
  );
}
