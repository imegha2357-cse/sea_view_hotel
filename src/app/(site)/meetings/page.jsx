import { MEETINGS } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Split from '@/components/site/Split';
import EnquiryForm from '@/components/EnquiryForm';
import { LineTitle } from '@/components/site/ui';
import { EventGrid, EventSteps } from '@/components/site/EventTypes';

export const metadata = meta('/meetings');

export default function Meetings() {
  return (
    <>
      <PageTop image="meeting" title="Meetings and events" text="A conference hall for meetings, training and family functions." trail={[{ label: 'Meetings and events', href: '/meetings' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <Split images={[MEETINGS.image]} tag="Conference hall" title={MEETINGS.title} text={MEETINGS.text} list={MEETINGS.facts} />
          <Split
            id="weddings-hall"
            images={['restaurant2']}
            tag="Celebrations"
            title="Weddings and family events"
            text="Celebrate with family and friends, with catering from Sea View Restaurant and rooms for guests travelling in. Tell us the date and numbers and we will plan it with you."
            list={['Catering from our restaurant', 'Rooms for out-of-town guests', 'Capacity and menus: please ask']}
            flip
          />
        </div>
      </section>
      <section className="sec cream" id="occasions" aria-labelledby="occ-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="occ-h">Events we host</LineTitle>
            <p>From a family lunch to a training day. Tell us the date and numbers and we will plan it with you.</p>
          </div>
          <EventGrid />
        </div>
      </section>
      <section className="sec" aria-labelledby="steps-h">
        <div className="container wide">
          <div className="sec-head">
            <LineTitle id="steps-h">How planning works</LineTitle>
          </div>
          <EventSteps />
        </div>
      </section>
      <section className="sec cream" id="plan" aria-labelledby="plan-h">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="sec-head">
            <LineTitle id="plan-h">Plan your event</LineTitle>
          </div>
          <EnquiryForm defaultType="meeting" />
        </div>
      </section>
    </>
  );
}
