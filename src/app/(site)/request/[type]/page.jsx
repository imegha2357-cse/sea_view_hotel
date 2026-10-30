import { notFound } from 'next/navigation';
import { HOTEL } from '@/data/content';
import { REQUEST_FORMS, REQUEST_SLUGS } from '@/data/requests';
import { WA_REQUESTS, waRequest } from '@/data/wa-requests';
import { meta } from '@/lib/meta';
import { waLink } from '@/lib/enquiry';
import PageTop from '@/components/site/PageTop';
import RequestForm from '@/components/RequestForm';
import Photo from '@/components/Photo';

export const dynamicParams = false;
export const generateStaticParams = () => REQUEST_SLUGS.map((type) => ({ type }));
export const generateMetadata = ({ params }) => meta(`/request/${params.type}`, { image: undefined });

export default function RequestPage({ params }) {
  const f = REQUEST_FORMS[params.type];
  if (!f) notFound();
  const others = REQUEST_SLUGS.filter((s) => s !== params.type);
  return (
    <>
      <PageTop image={f.image} title={f.title} text={f.intro} trail={[{ label: f.title, href: `/request/${params.type}` }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide req-layout">
          <div className="panel req-card">
            <RequestForm type={params.type} fields={f.fields} />
          </div>
          <aside className="req-side">
            <div className="frame req-photo">
              <Photo k={f.image} sizes="(max-width: 900px) 100vw, 380px" alt="" />
            </div>
            <p>
              Prefer to talk? Call <a href={`tel:${HOTEL.phoneHref}`}>{HOTEL.phone}</a> or{' '}
              <a href={waLink(`Hello, I have a question about: ${f.title}`)} target="_blank" rel="noopener noreferrer">
                message us on WhatsApp
              </a>
              .
            </p>
            <h2 className="req-side-h">Other requests</h2>
            <ul className="req-links">
              {others.map((s) => (
                <li key={s}>
                  <a href={`/request/${s}`}>{REQUEST_FORMS[s].title}</a>
                </li>
              ))}
              {Object.entries(WA_REQUESTS).map(([k, w]) => (
                <li key={k}>
                  <a href={waRequest(k)} target="_blank" rel="noopener noreferrer">
                    {w.title} (WhatsApp)
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
