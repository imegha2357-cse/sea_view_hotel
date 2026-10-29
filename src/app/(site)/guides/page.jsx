import Link from 'next/link';
import { GUIDES } from '@/data/content';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Photo from '@/components/Photo';
import { Chevron, Reveal } from '@/components/site/ui';

export const metadata = meta('/guides');

export default function Guides() {
  return (
    <>
      <PageTop image="beach" title="Kanyakumari guides" text="Short guides to help you plan your visit." trail={[{ label: 'Guides', href: '/guides' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide guide-grid">
          {GUIDES.map((g, i) => (
            <Reveal key={g.slug} i={i} className="guide-card zoom-hover">
              <Link href={`/guides/${g.slug}`} className="frame" tabIndex={-1} aria-hidden="true">
                <Photo k={g.image} sizes="(max-width: 800px) 100vw, 45vw" alt="" />
              </Link>
              <div className="card-body">
                <span className="tag-line">Guide</span>
                <h2>
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                </h2>
                <p>{g.summary}</p>
                <Link href={`/guides/${g.slug}`} className="more-link">
                  Read the guide <Chevron />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
