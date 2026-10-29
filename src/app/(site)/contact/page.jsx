import { HOTEL, mapsLink } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import MapEmbed from '@/components/site/MapEmbed';
import ReachTabs from '@/components/site/ReachTabs';
import { Chevron, LineTitle, Reveal } from '@/components/site/ui';

export const metadata = meta('/contact');

export default function Contact() {
  const cards = [
    { h: 'Reservations', lines: [{ t: HOTEL.phone, href: `tel:${HOTEL.phoneHref}` }, { t: `WhatsApp ${HOTEL.phone}`, href: `https://wa.me/${HOTEL.whatsapp}` }] },
    { h: 'Email', lines: [{ t: HOTEL.email, href: `mailto:${HOTEL.email}` }] },
    { h: 'Sea View Restaurant', lines: [{ t: HOTEL.restaurantPhone, href: `tel:${HOTEL.restaurantPhoneHref}` }] },
    { h: 'Address', lines: HOTEL.addressLines.map((t) => ({ t })) },
  ];
  return (
    <>
      <PageTop image="entrance" title="Contact us" trail={[{ label: 'Contact', href: '/contact' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <div className="contact-grid">
            {cards.map((c, i) => (
              <Reveal key={c.h} i={i} className="contact-card">
                <h2>{c.h}</h2>
                {c.lines.map((l) =>
                  l.href ? (
                    <a key={l.t} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                      {l.t}
                    </a>
                  ) : (
                    <span key={l.t}>{l.t}</span>
                  )
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="sec cream" id="reach" aria-labelledby="reach-h">
        <div className="container wide loc-grid">
          <Reveal style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
            <LineTitle id="reach-h">How to reach us</LineTitle>
            <ReachTabs />
            <a href={mapsLink} className="more-link" target="_blank" rel="noreferrer">
              Get directions <Chevron />
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <MapEmbed />
          </Reveal>
        </div>
      </section>
    </>
  );
}
