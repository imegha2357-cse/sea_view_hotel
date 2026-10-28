import { useEffect, useState } from 'react';
import Hero from '../sections/Hero';
import BookingBar from '../sections/BookingBar';
import SubNav from '../sections/SubNav';
import About from '../sections/About';
import Rooms from '../sections/Rooms';
import Facilities from '../sections/Facilities';
import Experiences from '../sections/Experiences';
import Gallery from '../sections/Gallery';
import Attractions from '../sections/Attractions';
import Location from '../sections/Location';
import Faq from '../sections/Faq';
import Enquire from '../sections/Enquire';
import Testimonials from '../sections/Testimonials';
import { WaveDivider } from '../components/Motion';
import { usePageMeta } from '../lib/seo';

export default function Home() {
  const [prefill, setPrefill] = useState(null);
  const merge = (p) => setPrefill((s) => ({ ...(s || {}), ...p }));

  usePageMeta(
    'Hotel Sea View, Kanyakumari | Sea-View Rooms by the Beach',
    'Hotel Sea View on East Car Street, Kanyakumari: sea-view rooms facing the sunrise, Vivekananda Rock and Thiruvalluvar Statue, a multi-cuisine restaurant and 24-hour room service. Enquire on WhatsApp or online.'
  );

  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView(), 50);
    }
  }, []);

  return (
    <main id="main">
      <Hero />
      <BookingBar onPrefill={merge} />
      <div style={{ height: 40 }} />
      <SubNav />
      <About />
      <Rooms onEnquire={merge} />
      <Facilities />
      <Experiences />
      <WaveDivider />
      <Gallery />
      <Testimonials />
      <Attractions />
      <Location />
      <Faq />
      <Enquire prefill={prefill} />
    </main>
  );
}
