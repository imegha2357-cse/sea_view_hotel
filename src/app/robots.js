import { SITE_URL } from '@/data/site';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/account', '/login', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
