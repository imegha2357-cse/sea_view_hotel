import { HOTEL } from '@/data/content';
import { photo } from '@/data/images';
import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import Photo from '@/components/Photo';

export const metadata = meta('/brand');

const COLOURS = [
  ['Deep Teal', '#173B3A'],
  ['Ivory', '#F4F0E7'],
  ['Sand Gold', '#B58A55'],
  ['Charcoal', '#25302F'],
  ['White', '#FFFFFF'],
];
const LOGOS = [
  ['/brand/wordmark-dark.png', 'Logo for light backgrounds', false],
  ['/brand/wordmark-light.png', 'Logo for dark backgrounds', true],
  ['/brand/s-mark.png', 'The S mark (icons and stamps)', false],
];
const PHOTOS = ['building', 'frontNight', 'roomCornerView', 'roomDeluxe', 'restaurant1', 'lounge', 'meeting', 'vivekananda'];

// For travel agents, press and partners: the official logo, colours and photos of the hotel.
export default function Brand() {
  return (
    <>
      <PageTop image="building" title="Brand and press" text="Logo, colours and approved photos for travel agents, press and partners." trail={[{ label: 'Brand and press', href: '/brand' }]} />
      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container wide brand-kit">
          <h2>Logo</h2>
          <p className="meta">Please do not stretch, recolour or add effects to the logo.</p>
          <ul className="bk-logos" role="list">
            {LOGOS.map(([src, label, dark]) => (
              <li key={src} className={dark ? 'dark' : ''}>
                <img src={src} alt={label} loading="lazy" />
                <span>{label}</span>
                <a href={src} download>
                  Download PNG
                </a>
              </li>
            ))}
          </ul>
          <h2>Colours</h2>
          <ul className="bk-colours" role="list">
            {COLOURS.map(([n, hex]) => (
              <li key={hex}>
                <span style={{ background: hex }} aria-hidden="true" />
                <b>{n}</b>
                <code>{hex}</code>
              </li>
            ))}
          </ul>
          <h2>Photos</h2>
          <p className="meta">You may use these photos to promote stays at Hotel Sea View. Please credit "Hotel Sea View, Kanyakumari".</p>
          <ul className="bk-photos" role="list">
            {PHOTOS.filter((k) => photo(k)).map((k) => (
              <li key={k}>
                <span className="frame">
                  <Photo k={k} sizes="(max-width: 700px) 50vw, 25vw" alt="" />
                </span>
                <a href={photo(k).src} download>
                  {photo(k).alt || 'Download'}
                </a>
              </li>
            ))}
          </ul>
          <h2>Contact</h2>
          <p>
            For press and partnerships, email <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a> or call {HOTEL.phone}. Travel agents can <a href="/request/agent">register here</a>.
          </p>
        </div>
      </section>
    </>
  );
}
