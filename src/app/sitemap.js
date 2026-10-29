import { PAGES } from '@/data/routes';
import { SITE_URL } from '@/data/site';

export default function sitemap() {
  const now = new Date();
  return PAGES.map((p) => ({ url: `${SITE_URL}${p.path === '/' ? '/' : p.path}`, lastModified: now, priority: Number(p.priority) }));
}
