import Link from 'next/link';
import { HOTEL, OFFERS } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import { Reveal } from '@/components/site/ui';

export const metadata = meta('/offers');

// Offers appear only when the hotel adds real ones to OFFERS in src/data/content.js.
export default function Offers() {
  return (
    <>
      <PageTop image="sunset" title="Offers" trail={[{ label: 'Offers', href: '/offers' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          {OFFERS.length ? (
            <div className="room-grid">
              {OFFERS.map((o, i) => (
                <Reveal key={o.code || o.title} i={i} className="card">
                  <div className="card-body">
                    {o.valid && <span className="tag-line">{o.valid}</span>}
                    <h3>{o.title}</h3>
                    <p>{o.text}</p>
                    {o.code && <p className="card-meta">Code: {o.code}</p>}
                    <div className="card-actions">
                      <Link href={`/enquire?promo_code=${encodeURIComponent(o.code || '')}`} className="btn solid sm">
                        Enquire
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="empty-state">
              <h2>No published offers right now</h2>
              <p style={{ maxWidth: '56ch', color: 'var(--muted)' }}>Ask our team for the best rate on your dates, or sign up at the bottom of this page to hear about offers first.</p>
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
