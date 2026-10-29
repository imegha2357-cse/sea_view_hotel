import Link from 'next/link';
import { HOTEL, OFFERS } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import OfferCard from '@/components/site/OfferCard';
import { Reveal } from '@/components/site/ui';

export const metadata = meta('/offers');

export default function Offers() {
  return (
    <>
      <PageTop image="sunset" title="Offers and packages" text="Ways to make the most of Kanyakumari. Our team confirms each rate with your dates." trail={[{ label: 'Offers', href: '/offers' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <p className="notice" style={{ marginBottom: 28 }}>
            Every offer is an enquiry, not an instant booking: choose one, send your dates, and we reply with availability and the rate by phone or WhatsApp.
          </p>
          {OFFERS.length ? (
            <div className="offer-grid">
              {OFFERS.map((o, i) => (
                <Reveal key={o.code} i={i % 3} id={o.code.toLowerCase()} className="offer-anchor">
                  <OfferCard o={o} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="empty-state">
              <h2>No published offers right now</h2>
              <p style={{ maxWidth: '56ch', color: 'var(--muted)' }}>Ask our team for the best rate on your dates.</p>
              <div className="card-actions" style={{ justifyContent: 'center' }}>
                <Link href="/enquire" className="btn solid">
                  Ask for a rate
                </Link>
                <a href={`https://wa.me/${HOTEL.whatsapp}`} className="btn outline dark" target="_blank" rel="noreferrer">
                  WhatsApp us
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
