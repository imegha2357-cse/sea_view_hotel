import { PAGES } from '@/data/routes';
import { SITE_URL } from '@/data/site';
import { getRooms } from '@/lib/cms-server';

// Fixed pages plus one page per published room type (managed in the admin panel).
export default async function sitemap() {
  const now = new Date();
  const rooms = await getRooms().catch(() => []);
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p.path === '/' ? '/' : p.path}`, lastModified: now, priority: Number(p.priority) })),
    ...rooms.map((r) => ({ url: `${SITE_URL}/rooms/${r.id}`, lastModified: now, priority: 0.8 })),
  ];
}
