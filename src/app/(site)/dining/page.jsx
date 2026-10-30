import { EXPERIENCES, HOTEL } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Split from '@/components/site/Split';
import PhotoStrip from '@/components/site/PhotoStrip';

export const metadata = meta('/dining');

export default function Dining() {
  const restaurant = EXPERIENCES.find((e) => e.id === 'restaurant');
  const bar = EXPERIENCES.find((e) => e.id === 'bar');
  return (
    <>
      <PageTop slot="dining" title="Dining" text="Sea View Restaurant, the Wave Bar and room service around the clock." trail={[{ label: 'Dining', href: '/dining' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <Split id="restaurant" images={restaurant.images} tag="Multi-cuisine" title={restaurant.title} text={restaurant.text} list={restaurant.details}>
            <div className="card-actions">
              <a href={`tel:${HOTEL.restaurantPhoneHref}`} className="btn solid">
                Call the restaurant
              </a>
            </div>
          </Split>
          <Split
            id="buffet"
            images={['buffetArea', 'buffet']}
            tag="Breakfast and buffets"
            title="The buffet"
            text="Breakfast and buffet meals are laid out in the restaurant under its carved wooden ceiling. Ask us whether breakfast is included in your rate."
            list={['Daily breakfast', 'Buffets for groups and functions on request']}
            flip
          />
          <Split id="bar" images={bar.images} tag="Bar" title={bar.title} text={bar.text} list={[...bar.details, 'Opening hours: please ask']} />
          <Split
            id="room-service"
            images={['dining']}
            tag="In your room"
            title="24-hour room service"
            text="Meals and help at any hour of the day or night. Call reception from your room's direct-dial phone."
            list={['Available day and night', 'Dishes from Sea View Restaurant']}
            flip
          />
        </div>
      </section>
      <PhotoStrip
        id="dining-photos"
        tone="cream"
        kicker="A look inside"
        title="Sea View Restaurant and Wave Bar"
        items={[
          { image: 'dining', caption: 'The dining hall' },
          { image: 'restaurant1', caption: 'Sea View Restaurant' },
          { image: 'buffet', caption: 'Buffet counter' },
          { image: 'restaurantHall', caption: 'Along the restaurant' },
          { image: 'restaurant2', caption: 'Tables set for dinner' },
          { image: 'bar1', caption: 'Wave Bar' },
        ]}
      />
    </>
  );
}
