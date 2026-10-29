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
import { pageMeta } from '../data/routes';
import { scrollToId } from '../lib/scroll';

export default function Home() {
  const [prefill, setPrefill] = useState(null);
  const merge = (p) => setPrefill((s) => ({ ...(s || {}), ...p }));

  const meta = pageMeta('/');
  usePageMeta(meta.title, meta.description);

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
