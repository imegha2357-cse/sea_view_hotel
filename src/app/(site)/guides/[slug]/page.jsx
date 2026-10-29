import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES } from '@/data/content';
import { PHOTOS } from '@/data/images';
import { SITE_URL } from '@/data/site';
import { meta } from '@/lib/meta';
import { JsonLd } from '@/lib/ld';
import PageTop from '@/components/site/PageTop';
import { Chevron } from '@/components/site/ui';

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));
export function generateMetadata({ params }) {
  const g = GUIDES.find((x) => x.slug === params.slug);
  return meta(`/guides/${params.slug}`, { image: g && PHOTOS[g.image].src });
}

export default function Guide({ params }) {
  const g = GUIDES.find((x) => x.slug === params.slug);
  if (!g) notFound();
  const other = GUIDES.filter((x) => x.slug !== g.slug);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: g.title,
          description: g.summary,
          image: `${SITE_URL}${PHOTOS[g.image].src}`,
          publisher: { '@id': `${SITE_URL}/#hotel` },
          mainEntityOfPage: `${SITE_URL}/guides/${g.slug}`,
        }}
      />
      <PageTop image={g.image} title={g.title} trail={[{ label: 'Guides', href: '/guides' }, { label: g.title, href: `/guides/${g.slug}` }]} />
      <article className="sec" style={{ paddingTop: 24 }}>
        <div className="container prose prose-wrap guide-body">
          <p className="lead">{g.summary}</p>
          {g.body.map(([tag, text]) => (tag === 'h2' ? <h2 key={text}>{text}</h2> : <p key={text.slice(0, 30)}>{text}</p>))}
          <div className="card-actions" style={{ marginTop: 12 }}>
            <Link href="/plan-your-visit" className="btn solid">
              Sunrise times and weather
            </Link>
            <Link href="/enquire" className="btn outline dark">
              Check availability
            </Link>
          </div>
          {other.length > 0 && (
            <p style={{ marginTop: 24 }}>
              More: {other.map((o) => (
                <Link key={o.slug} href={`/guides/${o.slug}`} className="more-link">
                  {o.title} <Chevron />
                </Link>
              ))}
            </p>
          )}
        </div>
      </article>
    </>
  );
}
