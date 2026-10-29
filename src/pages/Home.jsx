import { useEffect, useState } from 'react';
import Hero from '../sections/Hero';
import Marquee from '../sections/Marquee';
import Statement from '../sections/Statement';
import Building from '../sections/Building';
import Rooms from '../sections/Rooms';
import Amenities from '../sections/Amenities';
import Highlights from '../sections/Highlights';
import VideoBand from '../sections/VideoBand';
import Facilities from '../sections/Facilities';
import Experiences from '../sections/Experiences';
import Gallery from '../sections/Gallery';
import Testimonials from '../sections/Testimonials';
import Attractions from '../sections/Attractions';
import Location from '../sections/Location';
import Faq from '../sections/Faq';
import Enquire from '../sections/Enquire';
import { usePageMeta } from '../lib/seo';
import { scrollToId } from '../lib/scroll';

export default function Home() {
  const [prefill, setPrefill] = useState(null);
  const merge = (p) => setPrefill((s) => ({ ...(s || {}), ...p }));

  usePageMeta(
    'Hotel Sea View, Kanyakumari | Sea-View Rooms by the Beach',
    'Hotel Sea View on East Car Street, Kanyakumari: sea-view rooms facing the sunrise, Vivekananda Rock and Thiruvalluvar Statue, a multi-cuisine restaurant and 24-hour room service. Enquire on WhatsApp or online.'
  );

  useEffect(() => {
    if (window.location.hash) setTimeout(() => scrollToId(window.location.hash.slice(1)), 120);
  }, []);

  return (
    <main id="main">
      <Hero onPrefill={merge} />
      <Marquee />
      <Statement />
      <Building />
      <Rooms onEnquire={merge} />
      <Amenities />
      <Highlights />
      <VideoBand />
      <Facilities />
      <Experiences />
      <Gallery />
      <Testimonials />
      <Attractions />
      <Location />
      <Faq />
      <Enquire prefill={prefill} />
    </main>
  );
}
