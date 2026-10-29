import Link from 'next/link';
import { ATTRACTIONS, EXPERIENCES, FACTS, FAQS, GALLERY, HIGHLIGHT_SLIDES, HOTEL, OFFERS, OVERVIEW, ROOMS, mapsLink } from '@/data/content';
import { meta } from '@/lib/meta';
import { JsonLd, faqLd, hotelLd } from '@/lib/ld';
import Hero from '@/components/site/Hero';
import SectionTabs from '@/components/site/SectionTabs';
import Highlights from '@/components/site/Highlights';
import Rail from '@/components/site/Rail';
import RoomMosaic from '@/components/site/RoomMosaic';
import Reviews from '@/components/site/Reviews';
import BookingBar from '@/components/site/BookingBar';
import Facilities from '@/components/site/Facilities';
import Faq from '@/components/site/Faq';
import GalleryGrid from '@/components/site/GalleryGrid';
import MapEmbed from '@/components/site/MapEmbed';
import ReachTabs from '@/components/site/ReachTabs';
import { PlaceCard } from '@/components/site/Cards';
import { Chevron, LineTitle, ReadMore, Reveal } from '@/components/site/ui';
import Photo from '@/components/Photo';

export const metadata = meta('/');

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'dining', label: 'Dining' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'facilities', label: 'Hotel information' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'location', label: 'Location' },
  { id: 'faqs', label: 'FAQs' },
];

export default function Home() {
  const dining = EXPERIENCES.filter((e) => e.id !== 'meetings');
  return (
    <>
      <JsonLd data={[hotelLd, faqLd()]} />
      <Hero gallery={GALLERY} />
      <section className="plan-band" aria-label="Check availability">
        <div className="container wide">
          <BookingBar />
        </div>
      </section>
      <SectionTabs items={TABS} />

      <section className="sec" id="overview" aria-labelledby="overview-h">
        <div className="container wide overview">
          <Reveal className="overview-copy">
            <LineTitle id="overview-h">{OVERVIEW.title}</LineTitle>
            <ReadMore short={OVERVIEW.short} more={OVERVIEW.more} />
            <div className="facts-row">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <b>{f.value}</b>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="frame zoom-hover" delay={0.15}>
            <Photo k="building" sizes="(max-width: 900px) 100vw, 58vw" />
          </Reveal>
        </div>
      </section>

      <section className="sec" id="rooms" aria-labelledby="rooms-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="rooms-h">Rooms</LineTitle>
            <p>Five room types, each with a private bathroom, television and direct-dial phone, and room service around the clock.</p>
          </div>
          <RoomMosaic />
          <p style={{ marginTop: 28 }}>
            <Link href="/rooms" className="more-link">
              Compare all rooms <Chevron />
            </Link>
          </p>
        </div>
      </section>

      <Highlights slides={HIGHLIGHT_SLIDES} />

      <section className="sec" id="dining" aria-labelledby="dining-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="dining-h">Dining</LineTitle>
            <p>Sea View Restaurant serves Indian, Chinese and Continental food. Room service runs around the clock.</p>
          </div>
          {dining.map((e, i) => (
            <div key={e.id} className={`split ${i % 2 ? 'flip' : ''}`}>
              <Reveal className={e.images.length > 1 ? 'pair' : 'frame zoom-hover'}>
                {e.images.length > 1 ? (
                  e.images.map((k) => (
                    <div key={k} className="frame zoom-hover">
                      <Photo k={k} sizes="(max-width: 900px) 50vw, 28vw" />
                    </div>
                  ))
                ) : (
                  <Photo k={e.images[0]} sizes="(max-width: 900px) 100vw, 55vw" />
                )}
              </Reveal>
              <Reveal className="split-copy" delay={0.1}>
                <span className="tag-line">{e.tab}</span>
                <h3 className="h-caps" style={{ fontSize: 'clamp(24px, 2.6vw, 34px)' }}>
                  {e.title}
                </h3>
                <p className="lead">{e.text}</p>
                <ul>
                  {e.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <Link href={`/dining#${e.id}`} className="more-link">
                  More <Chevron />
                </Link>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="sec grey" id="experiences" aria-labelledby="exp-h">
        <div className="container wide">
          <Rail label="places" title={<LineTitle id="exp-h">Around Kanyakumari</LineTitle>}>
            {ATTRACTIONS.map((a) => (
              <PlaceCard key={a.name} a={a} />
            ))}
          </Rail>
          <p style={{ marginTop: 28 }}>
            <Link href="/experiences" className="more-link">
              Experiences and day plans <Chevron />
            </Link>
          </p>
        </div>
      </section>

      {OFFERS.length > 0 && (
        <section className="sec" id="offers" aria-labelledby="offers-h">
          <div className="container wide">
            <div className="sec-head-row">
              <LineTitle id="offers-h">Offers</LineTitle>
              <Link href="/offers" className="more-link">
                All offers <Chevron />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="sec" id="facilities" aria-labelledby="info-h">
        <div className="container wide info-grid">
          <Reveal>
            <LineTitle id="info-h">Hotel information</LineTitle>
            <dl className="info-list" style={{ marginTop: 28 }}>
              <div>
                <dt>Address</dt>
                <dd>{HOTEL.addressLines.join(', ')}</dd>
              </div>
              <div>
                <dt>Reservations and WhatsApp</dt>
                <dd>
                  <a href={`tel:${HOTEL.phoneHref}`}>{HOTEL.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Restaurant</dt>
                <dd>
                  <a href={`tel:${HOTEL.restaurantPhoneHref}`}>{HOTEL.restaurantPhone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
                </dd>
              </div>
              <div>
                <dt>Check-in and check-out</dt>
                <dd>Please ask when you enquire</dd>
              </div>
            </dl>
            <p style={{ marginTop: 24 }}>
              <Link href="/policies" className="more-link">
                Hotel policies <Chevron />
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="info-k" style={{ marginBottom: 14 }}>
              Facilities
            </h3>
            <Facilities />
          </Reveal>
        </div>
      </section>

      <section className="sec" id="gallery" aria-labelledby="gallery-h">
        <div className="container wide">
          <div className="sec-head-row">
            <LineTitle id="gallery-h">Gallery</LineTitle>
            <Link href="/gallery" className="more-link">
              All photos <Chevron />
            </Link>
          </div>
          <GalleryGrid items={GALLERY.slice(0, 10)} filters={false} />
        </div>
      </section>

      <Reviews />

      <section className="sec" id="location" aria-labelledby="loc-h">
        <div className="container wide loc-grid">
          <Reveal style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
            <LineTitle id="loc-h">Location</LineTitle>
            <address className="lead" style={{ fontStyle: 'normal' }}>
              {HOTEL.addressLines.map((l) => (
                <span key={l} style={{ display: 'block' }}>
                  {l}
                </span>
              ))}
            </address>
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

      <section className="sec grey" id="faqs" aria-labelledby="faq-h">
        <div className="container" style={{ maxWidth: 920 }}>
          <div className="sec-head center">
            <LineTitle id="faq-h" center>
              Frequently asked questions
            </LineTitle>
          </div>
          <Faq items={FAQS} />
        </div>
      </section>

      <section className="sec cta-band">
        <div className="container">
          <h2>Wake up to the sunrise</h2>
          <p>Send us your dates and our team will confirm availability and the best rate by phone or WhatsApp.</p>
          <div className="row">
            <Link href="/enquire" className="btn ghost-light">
              Check availability
            </Link>
            <a href={`https://wa.me/${HOTEL.whatsapp}`} className="btn outline light" target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
