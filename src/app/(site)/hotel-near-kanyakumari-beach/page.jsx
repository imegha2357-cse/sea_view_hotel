import { LANDING } from '@/data/landing';
import { meta } from '@/lib/meta';
import Landing from '@/components/site/Landing';

const PATH = '/hotel-near-kanyakumari-beach';
const copy = LANDING[PATH];
export const metadata = { ...meta(PATH), alternates: { canonical: meta(PATH).alternates.canonical, languages: { en: '/', ta: '/ta', hi: '/hi', ml: '/ml' } } };
export const revalidate = 600;

export default function Page() {
  return <Landing path={PATH} copy={copy} lang={copy.lang} photos={copy.photos} roomFilter={copy.sea ? (r) => /sea/i.test(r.view || '') || (r.amenities || []).includes('sea_view') : undefined} />;
}
