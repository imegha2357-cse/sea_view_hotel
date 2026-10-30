import { meta } from '@/lib/meta';
import { getPosts } from '@/lib/cms-server';
import PageTop from '@/components/site/PageTop';
import Photo from '@/components/Photo';
import { Reveal } from '@/components/site/ui';

export const metadata = meta('/news');
export const revalidate = 300;

const fmt = (d) => (d ? new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');

export default async function News() {
  const posts = await getPosts();
  return (
    <>
      <PageTop image="sunset" title="News and travel notes" text="From the hotel and around Kanyakumari." trail={[{ label: 'News', href: '/news' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide">
          {!posts.length && <p className="meta">No posts yet. Visit our <a href="/guides">travel guides</a> in the meantime.</p>}
          <ul className="post-grid" role="list">
            {posts.map((p, i) => (
              <Reveal as="li" key={p.slug} i={i % 3}>
                <a href={`/news/${p.slug}`} className="post-card">
                  <span className="frame zoom-hover">
                    <Photo k={p.image || 'seaView'} sizes="(max-width: 700px) 100vw, 33vw" alt="" />
                  </span>
                  <small>{fmt(p.date)}</small>
                  <h2>{p.title}</h2>
                  {p.summary && <p>{p.summary}</p>}
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
