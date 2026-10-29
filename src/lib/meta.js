// Next.js metadata for each public page, from the single list in src/data/routes.js (PRD 10.1).
import { pageMeta } from '@/data/routes';
import { SITE_URL } from '@/data/site';

const OG = '/images/Hotel-Sea-View-Deluxe-Seaview-Rooms.jpg';

export function meta(path, { image, noindex = false } = {}) {
  const p = pageMeta(path);
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      siteName: 'Hotel Sea View',
      locale: 'en_IN',
      url,
      title: p.title.split(' | ')[0],
      description: p.description,
      images: [{ url: image || OG }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const privateMeta = (title) => ({ title: { absolute: `${title} | Hotel Sea View` }, robots: { index: false, follow: false } });
