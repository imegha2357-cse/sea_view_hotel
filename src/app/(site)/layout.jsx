import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Floating from '@/components/site/Floating';
import NavLoader from '@/components/site/NavLoader';
import { Suspense } from 'react';

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Floating />
      <Suspense>
        <NavLoader />
      </Suspense>
    </>
  );
}
