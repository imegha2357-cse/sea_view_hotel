import { HOTEL } from '@/data/content';
import { meta } from '@/lib/meta';
import { JsonLd, menuLd } from '@/lib/ld';
import { getList } from '@/lib/cms-server';
import PageTop from '@/components/site/PageTop';
import MenuView from '@/components/site/MenuView';

export const metadata = meta('/dining/menu');
export const revalidate = 300;

export default async function Menu() {
  const items = await getList('menu');
  return (
    <>
      {items.length > 0 && <JsonLd data={menuLd(items)} />}
      <PageTop slot="dining" title="Restaurant menu" text="Sea View Restaurant: Indian, Chinese and Continental, vegetarian and non-vegetarian." trail={[{ label: 'Dining', href: '/dining' }, { label: 'Menu', href: '/dining/menu' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container">
          {items.length ? (
            <MenuView items={items} />
          ) : (
            <div className="panel empty-note">
              <h2>The full menu is coming soon</h2>
              <p>
                Until then, call the restaurant on <a href={`tel:${HOTEL.restaurantPhoneHref}`}>{HOTEL.restaurantPhone}</a> to ask what is cooking today.
              </p>
            </div>
          )}
          <p className="meta" style={{ marginTop: 24 }}>
            Dishes and prices can change. Tell our team about any allergy before you order. <a href="/request/table">Reserve a table</a>
          </p>
        </div>
      </section>
    </>
  );
}
