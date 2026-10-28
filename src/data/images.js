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

export function img(key) {
  const item = IMAGE_MANIFEST[key];
  if (!item) throw new Error(`Unknown image key: ${key}`);
  return {
    src: SOURCE === 'local' ? `/images/${localName(item.path)}` : remoteUrl(item.path),
    fallback: remoteUrl(item.path),
    alt: item.alt,
  };
}
