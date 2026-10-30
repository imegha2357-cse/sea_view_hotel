import { notFound } from 'next/navigation';
import { SITE_URL } from '@/data/site';
import { getPost, getPosts } from '@/lib/cms-server';
import { JsonLd } from '@/lib/ld';
import PageTop from '@/components/site/PageTop';

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }) {
  const p = await getPost(params.slug);
  if (!p) return { title: 'Not found' };
  return { title: { absolute: `${p.title} | Hotel Sea View, Kanyakumari` }, description: (p.summary || p.body.slice(0, 155)).slice(0, 160), alternates: { canonical: `${SITE_URL}/news/${params.slug}` } };
}

// Posts are plain text: blank lines split paragraphs, "## " starts a heading. No HTML is rendered.
export default async function Post({ params }) {
  const p = await getPost(params.slug);
  if (!p) notFound();
  const blocks = p.body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, datePublished: p.date, author: { '@type': 'Organization', name: 'Hotel Sea View' }, mainEntityOfPage: `${SITE_URL}/news/${params.slug}` }} />
      <PageTop image={p.image || 'sunset'} title={p.title} text={p.summary} trail={[{ label: 'News', href: '/news' }, { label: p.title, href: `/news/${params.slug}` }]} />
      <article className="sec post-body" style={{ paddingTop: 24 }}>
        <div className="container narrow">
          {p.date && <p className="meta">{new Date(p.date + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>}
          {blocks.map((b, i) => (b.startsWith('## ') ? <h2 key={i}>{b.slice(3)}</h2> : <p key={i}>{b}</p>))}
          <p>
            <a href="/news">← All news</a>
          </p>
        </div>
      </article>
    </>
  );
}
