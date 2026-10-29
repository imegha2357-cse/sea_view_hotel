import { Suspense } from 'react';
import { HOTEL } from '@/data/content';
import { meta } from '@/lib/meta';
import Crumbs from '@/components/site/Crumbs';
import EnquireForm from '@/components/site/EnquireForm';
import { LineTitle } from '@/components/site/ui';

export const metadata = meta('/enquire');

export default function Enquire() {
  return (
    <div className="plain-top">
      <Crumbs trail={[{ label: 'Book a stay', href: '/enquire' }]} title="Book a stay at Hotel Sea View" />
      <section className="sec" style={{ paddingTop: 16 }}>
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="sec-head">
            <LineTitle as="h1">Book a stay</LineTitle>
            <p>
              Tell us your dates and we will confirm availability and price by phone or WhatsApp, usually the same day. You can also call {HOTEL.phone}.
            </p>
          </div>
          <Suspense>
            <EnquireForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
