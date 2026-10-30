import { getSite } from '@/lib/cms-server';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import GalleryGrid from '@/components/site/GalleryGrid';
import { GuestPhotos } from '@/components/site/ListSections';

export const metadata = meta('/gallery');
export const revalidate = 600;

export default async function Gallery() {
  const { gallery } = await getSite();
  return (
    <>
      <PageTop slot="gallery" title="Gallery" trail={[{ label: 'Gallery', href: '/gallery' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          {gallery.length ? <GalleryGrid items={gallery} /> : <p className="empty-note">New photos are on the way.</p>}
        </div>
      </section>
      <GuestPhotos />
    </>
  );
}
