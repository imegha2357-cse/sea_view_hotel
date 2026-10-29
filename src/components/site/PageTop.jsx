import Banner from './Banner';
import Crumbs from './Crumbs';
import { JsonLd, crumbsLd } from '@/lib/ld';

// Inner page opening: photo banner with the title, then breadcrumbs and Share (Taj hotel pages).
export default function PageTop({ image, title, text, trail }) {
  return (
    <>
      <JsonLd data={crumbsLd(trail)} />
      <Banner image={image} title={title} text={text} />
      <Crumbs trail={trail} title={`${title} | Hotel Sea View, Kanyakumari`} />
    </>
  );
}
