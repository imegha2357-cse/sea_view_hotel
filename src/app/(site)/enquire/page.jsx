import { Suspense } from 'react';
import { HOTEL } from '@/data/content';
import { meta } from '@/lib/meta';
import Crumbs from '@/components/site/Crumbs';
import EnquireForm from '@/components/site/EnquireForm';
import { LineTitle } from '@/components/site/ui';
import PhotoStrip from '@/components/site/PhotoStrip';

export const metadata = meta('/enquire');

export default function Enquire() {
  return (
    <div className="plain-top">
      <Crumbs trail={[{ label: 'Check availability', href: '/enquire' }]} title="Check availability at Hotel Sea View" />
      <section className="sec" style={{ paddingTop: 16 }}>
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="sec-head">
            <LineTitle as="h1">Check availability</LineTitle>
            <p>
              Tell us your dates and we will confirm availability and price by phone or WhatsApp, usually the same day. You can also call {HOTEL.phone}.
            </p>
          </div>
          <Suspense>
            <EnquireForm />
          </Suspense>
        </div>
      </section>
      <PhotoStrip
        id="stay"
        tone="cream"
        kicker="Your stay"
        title="What is waiting for you"
        items={[
          { image: 'roomCornerView', caption: 'Sunrise view from a corner room' },
          { image: 'roomDeluxe', caption: 'Deluxe Seaview Room' },
          { image: 'roomSuite', caption: 'Executive Suite' },
          { image: 'dining', caption: 'Sea View Restaurant' },
          { image: 'frontNight', caption: 'Hotel Sea View at night' },
        ]}
      />
    </div>
  );
}
