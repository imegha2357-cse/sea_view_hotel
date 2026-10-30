import { FAQS, HOTEL, POLICIES } from '@/data/content';
import { meta } from '@/lib/meta';
import { JsonLd, faqLd } from '@/lib/ld';
import PageTop from '@/components/site/PageTop';
import Faq from '@/components/site/Faq';
import PhotoStrip from '@/components/site/PhotoStrip';
import { HousePolicies } from '@/components/site/ListSections';

export const revalidate = 600;
import { LineTitle, Reveal } from '@/components/site/ui';

export const metadata = meta('/policies');

// Only facts the hotel has published; the rest say "ask the hotel".
export default function Policies() {
  return (
    <>
      <JsonLd data={faqLd()} />
      <PageTop slot="policies" title="Hotel policies" text={`If something is not covered here, call ${HOTEL.phone}.`} trail={[{ label: 'Policies', href: '/policies' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <div className="policy-grid">
            {POLICIES.map((p, i) => (
              <Reveal key={p.title} i={i % 3} className="policy">
                <h2>{p.title}</h2>
                <p>{p.text}</p>
                {!p.confirmed && <span className="tag muted">Ask the hotel</span>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <HousePolicies />
      <PhotoStrip
        id="arrival"
        kicker="Your arrival"
        title="Reception, lounge and lobby"
        text="Reception is up the marble steps from the entrance porch. Our team can help with anything not covered on this page."
        items={[
          { image: 'entranceDoors', caption: 'Entrance' },
          { image: 'lobbyEntrance', caption: 'Lobby' },
          { image: 'lounge', caption: 'Lounge' },
          { image: 'frontNight', caption: 'The entrance porch at night' },
        ]}
      />
      <section className="sec grey" id="faqs" aria-labelledby="faq-h">
        <div className="container" style={{ maxWidth: 920 }}>
          <div className="sec-head center">
            <LineTitle id="faq-h" center>
              Frequently asked questions
            </LineTitle>
          </div>
          <Faq items={FAQS} search extra={POLICIES.filter((p) => p.confirmed).map((p) => ({ q: p.title, a: p.text }))} />
        </div>
      </section>
    </>
  );
}
