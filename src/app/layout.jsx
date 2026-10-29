import '@/styles/app.css';
import '@/styles/site.css';
import '@/styles/coast.css';
import '@/styles/cms.css';
import { SITE_URL } from '@/data/site';
import { AuthProvider } from '@/lib/auth';
import CookieConsent from '@/components/CookieConsent';
import Boot from '@/components/site/Boot';
import Loader, { loaderScript } from '@/components/site/Loader';
import { SiteDataProvider } from '@/components/SiteData';
import { getSiteData } from '@/lib/cms-server';
import { body, display } from './fonts';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Hotel Sea View, Kanyakumari', template: '%s | Hotel Sea View' },
  applicationName: 'Hotel Sea View',
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#173B3A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Applied before the first paint so dark mode and larger text never flash.
const prefs = `try{var p=JSON.parse(localStorage.getItem('seaview-display')||'{}');var r=document.documentElement;if(p.theme)r.dataset.theme=p.theme;if(p.large)r.dataset.text='large'}catch(e){}`;

export default async function RootLayout({ children }) {
  const data = await getSiteData();
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefs }} />
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
        <link rel="preload" href="/brand/s-mark.png" as="image" />
      </head>
      <body>
        <Loader />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AuthProvider>
          <SiteDataProvider value={data}>{children}</SiteDataProvider>
          <CookieConsent />
          <Boot />
        </AuthProvider>
      </body>
    </html>
  );
}
