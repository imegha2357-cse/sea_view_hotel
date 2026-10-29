import Banner from './Banner';
import Crumbs from './Crumbs';
import { JsonLd, crumbsLd } from '@/lib/ld';
import { getBanner } from '@/lib/cms-server';

// Inner page opening: photo banner with the title, then breadcrumbs and Share (Taj hotel pages).
// `slot` names a banner the admin can change (see BANNER_SLOTS); `image` is used otherwise.
export default async function PageTop({ image, slot, title, text, trail }) {
  const photo = slot ? await getBanner(slot) : image;
  return (
    <>
      <JsonLd data={crumbsLd(trail)} />
      <Banner image={photo} title={title} text={text} />
      <Crumbs trail={trail} title={`${title} | Hotel Sea View, Kanyakumari`} />
    </>
  );
}
