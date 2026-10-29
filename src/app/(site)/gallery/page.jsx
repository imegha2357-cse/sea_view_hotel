import { GALLERY } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import GalleryGrid from '@/components/site/GalleryGrid';

export const metadata = meta('/gallery');

export default function Gallery() {
  return (
    <>
      <PageTop image="building" title="Gallery" trail={[{ label: 'Gallery', href: '/gallery' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          <GalleryGrid items={GALLERY} />
        </div>
      </section>
    </>
  );
}
