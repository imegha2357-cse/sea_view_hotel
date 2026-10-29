import { HOTEL } from '@/data/content';
import { meta } from '@/lib/meta';
import Crumbs from '@/components/site/Crumbs';

export const metadata = meta('/accessibility');

export default function Accessibility() {
  return (
    <div className="plain-top">
      <Crumbs trail={[{ label: 'Accessibility', href: '/accessibility' }]} title="Accessibility | Hotel Sea View" />
      <div className="container prose prose-wrap sec" style={{ paddingTop: 16 }}>
        <h1>Accessibility</h1>
        <p>We want everyone to be able to use this website. It is built to the Web Content Accessibility Guidelines (WCAG 2.1, level AA) and is tested with a keyboard and screen readers.</p>
        <h2>What you can do</h2>
        <ul>
          <li>Use the whole site with a keyboard. Press Tab to move and Enter to choose; &ldquo;Skip to content&rdquo; is the first link on every page.</li>
          <li>Make text larger, or switch to dark mode, from the links at the very bottom of every page. The site remembers your choice.</li>
          <li>Turn on &ldquo;reduce motion&rdquo; in your device settings and the site stops sliding and zooming, using simple fades instead.</li>
          <li>Pause the photo carousels by moving the mouse over them or tabbing into them.</li>
          <li>Zoom the page up to 400% without losing content.</li>
        </ul>
        <h2>About the hotel building</h2>
        <p>For step-free access, lifts and accessible rooms, please call {HOTEL.phone} before you book so we can advise and prepare.</p>
        <h2>Tell us about a problem</h2>
        <p>
          If something on the site does not work for you, use &ldquo;Website feedback&rdquo; at the bottom of any page, email <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a> or call {HOTEL.phone}.
        </p>
      </div>
    </div>
  );
}
