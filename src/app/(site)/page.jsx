import Link from 'next/link';
import { POLICIES, ATTRACTIONS, EXPERIENCES, FACTS, FAQS, HIGHLIGHT_SLIDES, HOTEL, OVERVIEW } from '@/data/content';
import { meta } from '@/lib/meta';
import { JsonLd, faqLd, hotelLd } from '@/lib/ld';
import Hero from '@/components/site/Hero';
import SectionTabs from '@/components/site/SectionTabs';
import Highlights from '@/components/site/Highlights';
import Rail from '@/components/site/Rail';
import RoomMosaic from '@/components/site/RoomMosaic';
import Reviews from '@/components/site/Reviews';
import FeatureCards from '@/components/site/FeatureCards';
import HighlightTabs from '@/components/site/HighlightTabs';
import OfferCard from '@/components/site/OfferCard';
import { EventGrid } from '@/components/site/EventTypes';
import { getOffers, getRooms, getSite } from '@/lib/cms-server';
import { slugify } from '@/data/catalog';
import HotelInfo from '@/components/site/HotelInfo';
import Faq from '@/components/site/Faq';
import GalleryGrid from '@/components/site/GalleryGrid';
import LocationSection from '@/components/site/LocationSection';
import { PlaceCard } from '@/components/site/Cards';
import { Chevron, LineTitle, ReadMore, Reveal } from '@/components/site/ui';
import Photo from '@/components/Photo';

export const metadata = meta('/');
export const revalidate = 600;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'dining', label: 'Dining' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'offers', label: 'Offers' },
  { id: 'events', label: 'Events' },
  { id: 'facilities', label: 'Hotel information' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'location', label: 'Location' },
  { id: 'faqs', label: 'FAQs' },
];

export default async function Home() {
  const [rooms, offers, site] = await Promise.all([getRooms(), getOffers(), getSite()]);
  const dining = EXPERIENCES.filter((e) => e.id !== 'meetings');
  return (
    <>
      <JsonLd data={[hotelLd, faqLd()]} />
      <Hero slides={site.hero} gallery={site.gallery} />
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

      <FeatureCards />

      <section className="sec" id="rooms" aria-labelledby="rooms-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="rooms-h">Rooms</LineTitle>
            <p>Five room types, each with a private bathroom, television and direct-dial phone, and room service around the clock.</p>
          </div>
          <RoomMosaic rooms={rooms} categories={site.categories} />
          <p style={{ marginTop: 28 }}>
            <Link href="/rooms" className="more-link">
              Compare all rooms <Chevron />
            </Link>
          </p>
        </div>
      </section>

      <Highlights slides={HIGHLIGHT_SLIDES.map((h) => ({ ...h, image: site.highlights[slugify(h.title)] || h.image }))} />

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

      <HighlightTabs />

      <section className="sec" id="experiences" aria-labelledby="exp-h">
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

      {offers.length > 0 && (
        <section className="sec cream" id="offers" aria-labelledby="offers-h">
          <div className="container wide">
            <Rail label="offers" title={<LineTitle id="offers-h">Offers and packages</LineTitle>}>
              {offers.map((o) => (
                <OfferCard key={o.code} o={o} />
              ))}
            </Rail>
            <p style={{ marginTop: 28 }}>
              <Link href="/offers" className="more-link">
                All offers <Chevron />
              </Link>
            </p>
          </div>
        </section>
      )}

      <section className="sec" id="events" aria-labelledby="events-h">
        <div className="container wide">
          <div className="sec-head-row">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <LineTitle id="events-h">Weddings, meetings and events</LineTitle>
              <p>A conference hall, our restaurant and rooms for your guests, all in one place.</p>
            </div>
            <Link href="/meetings" className="more-link">
              All events <Chevron />
            </Link>
          </div>
          <EventGrid limit={4} />
        </div>
      </section>

      <HotelInfo />

      {site.gallery.length > 0 && (
      <section className="sec" id="gallery" aria-labelledby="gallery-h">
        <div className="container wide">
          <div className="sec-head-row">
            <LineTitle id="gallery-h">Gallery</LineTitle>
            <Link href="/gallery" className="more-link">
              All photos <Chevron />
            </Link>
          </div>
          <GalleryGrid items={site.gallery.slice(0, 10)} filters={false} />
        </div>
      </section>
      )}

      <Reviews />

      <LocationSection />

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

      <section className="sec cta-band has-photo">
        <div className="cta-photo" aria-hidden="true">
          <Photo k="sunset" sizes="100vw" alt="" quality={60} />
        </div>
        <div className="container">
          <h2>Wake up to the sunrise</h2>
          <p>Send us your dates and our team will confirm availability and the best rate by phone or WhatsApp.</p>
          <div className="row">
            <Link href="/enquire" className="btn solid ghost-light">
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
