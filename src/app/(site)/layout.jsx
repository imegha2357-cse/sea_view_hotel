import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Floating from '@/components/site/Floating';
import NavLoader from '@/components/site/NavLoader';
import { Suspense } from 'react';
import ThemeRibbon from '@/components/site/ThemeRibbon';
import WelcomeBack from '@/components/site/WelcomeBack';

export default function SiteLayout({ children }) {
  return (
    <>
      <ThemeRibbon />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Floating />
      <WelcomeBack />
      <Suspense>
        <NavLoader />
      </Suspense>
    </>
  );
}
