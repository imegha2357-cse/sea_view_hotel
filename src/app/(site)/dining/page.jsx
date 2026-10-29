import { EXPERIENCES, HOTEL } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Split from '@/components/site/Split';

export const metadata = meta('/dining');

export default function Dining() {
  const restaurant = EXPERIENCES.find((e) => e.id === 'restaurant');
  const bar = EXPERIENCES.find((e) => e.id === 'bar');
  return (
    <>
      <PageTop image="restaurant1" title="Dining" text="Sea View Restaurant, the Wave Bar and room service around the clock." trail={[{ label: 'Dining', href: '/dining' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <Split id="restaurant" images={restaurant.images} tag="Multi-cuisine" title={restaurant.title} text={restaurant.text} list={restaurant.details}>
            <div className="card-actions">
              <a href={`tel:${HOTEL.restaurantPhoneHref}`} className="btn solid">
                Call the restaurant
              </a>
            </div>
          </Split>
          <Split id="bar" images={bar.images} tag="Bar" title={bar.title} text={bar.text} list={[...bar.details, 'Opening hours: please ask']} flip />
          <Split
            id="room-service"
            images={['dining']}
            tag="In your room"
            title="24-hour room service"
            text="Meals and help at any hour of the day or night. Call reception from your room's direct-dial phone."
            list={['Available day and night', 'Dishes from Sea View Restaurant']}
          />
        </div>
      </section>
    </>
  );
}
