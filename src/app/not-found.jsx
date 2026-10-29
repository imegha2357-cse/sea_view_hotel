import Link from 'next/link';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';

export const metadata = { title: { absolute: 'Page not found | Hotel Sea View' }, robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="plain-top">
        <section className="sec">
          <div className="container" style={{ maxWidth: 720, display: 'grid', gap: 18, justifyItems: 'start' }}>
            <span className="tag-line">404</span>
            <h1 className="h-caps">This page could not be found</h1>
            <p className="lead">The link may be old, or the address mistyped. These might help:</p>
            <div className="card-actions">
              <Link href="/" className="btn solid">
                Home
              </Link>
              <Link href="/rooms" className="btn outline dark">
                Rooms
              </Link>
              <Link href="/enquire" className="btn outline dark">
                Book a stay
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
