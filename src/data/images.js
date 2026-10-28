// Every photo used on the site comes from the hotel's current website (hotelseaview.in).
// The client must confirm these photos are authorised for reuse (PRD section 11).
//
// VITE_IMAGE_SOURCE=remote  -> load straight from hotelseaview.in (works immediately)
// VITE_IMAGE_SOURCE=local   -> load from /public/images after `npm run fetch-images` (faster, recommended for production)

const BASE = 'https://hotelseaview.in/wp-content/uploads';

export const IMAGE_MANIFEST = {
  logo: { path: '2025/04/Hotel-Sea-View.png', alt: 'Hotel Sea View logo' },
  logoFooter: { path: '2025/06/seaviewl.png', alt: 'Hotel Sea View logo' },
  favicon: { path: '2025/07/cropped-web-app-manifest-192x192-1-270x270.png', alt: '' },

  front: { path: '2025/07/sea-view-front.jpg', alt: 'Hotel Sea View building from the street' },
  frontAlt: { path: '2025/07/sea-view-frount.jpg', alt: 'Front view of Hotel Sea View, Kanyakumari' },

  roomStandard: { path: '2025/06/Hotel-Sea-View-Standard-Rooms.jpg', alt: 'Standard Room with wooden furnishings' },
  roomDeluxe: { path: '2025/06/Hotel-Sea-View-Deluxe-Seaview-Rooms.jpg', alt: 'Deluxe Seaview Room facing the sea' },
  roomCorner: { path: '2025/07/Corner-DLX-Room.jpg', alt: 'Corner Deluxe Room with sunrise view' },
  roomTwin: { path: '2025/06/Hotel-Sea-View-Twin-Rooms.jpg', alt: 'Interconnected Twin Rooms' },
  roomSuite: { path: '2025/06/Hotel-Sea-View-Executive-Suit-Rooms.jpg', alt: 'Executive Suite' },

  restaurant1: { path: '2025/06/Hotel-Sea-View-Restaurant-1.jpg', alt: 'Sea View Restaurant dining room' },
  restaurant2: { path: '2025/06/Hotel-Sea-View-Restaurant-2.jpg', alt: 'Tables at Sea View Restaurant' },
  bar1: { path: '2025/06/Hotel-Sea-View-Bar-1-1.jpg', alt: 'Wave Bar seating' },
  bar2: { path: '2025/06/Hotel-Sea-View-Bar-2.jpg', alt: 'Wave Bar counter' },
  meeting: { path: '2025/06/Hotel-Sea-View-Meeting.jpg', alt: 'Conference hall set up for a meeting' },

  vivekananda: { path: '2025/07/vivekananda-rock-glass-bridge.jpg', alt: 'Vivekananda Rock Memorial and glass bridge' },
  thiruvalluvar: { path: '2025/07/Thiruvalluvar-Statue.jpg', alt: 'Thiruvalluvar Statue off the Kanyakumari coast' },
  beach: { path: '2025/07/kanyakumari-beach.jpg', alt: 'Kanyakumari beach' },
  gandhi: { path: '2025/07/Gandhi-Memorial-kanyakumari.jpg', alt: 'Gandhi Memorial Mandapam' },
  sunset: { path: '2025/07/Sun-Set-Point.jpg', alt: 'Sunset Point, Kanyakumari' },
};

const SOURCE = import.meta.env.VITE_IMAGE_SOURCE === 'local' ? 'local' : 'remote';

export const localName = (path) => path.split('/').pop();
export const remoteUrl = (path) => `${BASE}/${path}`;

// FR-09 / PRD 10.2: serve resized, compressed copies (AVIF/WebP) through Vercel Image Optimization.
// The widths must match "images.sizes" in vercel.json. Set VITE_IMAGE_CDN=off to disable
// (for example when hosting on Firebase Hosting instead of Vercel).
export const IMAGE_WIDTHS = [480, 828, 1200, 1920];
const CDN = import.meta.env.PROD && import.meta.env.VITE_IMAGE_CDN !== 'off';

const cdnUrl = (url, w) => `/_vercel/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;

export function img(key, { width = 1200 } = {}) {
  const item = IMAGE_MANIFEST[key];
  if (!item) throw new Error(`Unknown image key: ${key}`);
  const original = SOURCE === 'local' ? `/images/${localName(item.path)}` : remoteUrl(item.path);
  const isPng = item.path.endsWith('.png');
  const useCdn = CDN && !isPng;
  const w = IMAGE_WIDTHS.find((x) => x >= width) || IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  return {
    src: useCdn ? cdnUrl(original, w) : original,
    srcSet: useCdn ? IMAGE_WIDTHS.map((x) => `${cdnUrl(original, x)} ${x}w`).join(', ') : undefined,
    fallback: remoteUrl(item.path),
    alt: item.alt,
  };
}
