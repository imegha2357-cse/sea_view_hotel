// Every photo comes from the hotel's own website (hotelseaview.in), stored here in HD (1360-2560px wide).
// Photos the hotel only published at low resolution were enlarged 4x with Real-ESRGAN (see UPSCALED).
// Ask the hotel for the camera originals to replace them. The client must confirm reuse rights (PRD 11).
//
// Images are delivered by Cloudinary when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set (see src/components/Photo.jsx),
// otherwise by Next.js image optimisation on Vercel. Either way visitors get AVIF/WebP at the right size.

const P = (file, w, h, alt) => ({ src: `/images/${file}`, width: w, height: h, alt });

export const PHOTOS = {
  building: P('Hotel-Sea-View.jpg', 2560, 1097, 'Hotel Sea View building on East Car Street, Kanyakumari'),
  entrance: P('hotel-sea-view-door.jpg', 1360, 765, 'Hotel entrance porch at night'),
  lobby: P('sea-view-front.jpg', 2560, 1923, 'Hotel lobby with leather sofas and a flower rangoli'),
  dining: P('sea-view-frount.jpg', 2560, 1919, 'Dining area with lattice screens'),
  seaView: { src: '/media/sea-loop-poster.jpg', width: 1600, height: 666, alt: 'View from a sea-facing room over Kanyakumari towards the Vivekananda Rock Memorial' },
  tourPoster: { src: '/media/room-tour-poster.jpg', width: 1280, height: 720, alt: 'Still from the Hotel Sea View room tour video' },

  roomStandard: P('Hotel-Sea-View-Standard-Rooms.jpg', 2560, 1704, 'Standard Room with wooden furnishings'),
  roomDeluxe: P('Hotel-Sea-View-Deluxe-Seaview-Rooms.jpg', 1600, 1067, 'Deluxe Seaview Room facing the sea'),
  roomCorner: P('Corner-DLX-Room.jpg', 2560, 1704, 'Corner Deluxe Room with sunrise view'),
  roomTwin: P('Hotel-Sea-View-Twin-Rooms.jpg', 2560, 1708, 'Interconnected Twin Rooms'),
  roomSuite: P('Hotel-Sea-View-Executive-Suit-Rooms.jpg', 2560, 1701, 'Executive Suite'),

  restaurant1: P('Hotel-Sea-View-Restaurant-1.jpg', 1360, 1020, 'Sea View Restaurant dining room'),
  restaurant2: P('Hotel-Sea-View-Restaurant-2.jpg', 1360, 1020, 'Tables at Sea View Restaurant'),
  bar1: P('Hotel-Sea-View-Bar-1-1.jpg', 1360, 1020, 'Wave Bar seating'),
  bar2: P('Hotel-Sea-View-Bar-2.jpg', 1360, 1020, 'Wave Bar counter'),
  meeting: P('Hotel-Sea-View-Meeting.jpg', 1920, 1336, 'Conference hall set up for a meeting'),

  vivekananda: P('vivekananda-rock-glass-bridge.jpg', 2560, 1905, 'Vivekananda Rock Memorial and the glass bridge'),
  thiruvalluvar: P('Thiruvalluvar-Statue.jpg', 2560, 1905, 'Thiruvalluvar Statue off the Kanyakumari coast'),
  beach: P('kanyakumari-beach.jpg', 2560, 1905, 'Kanyakumari beach'),
  gandhi: P('Gandhi-Memorial-kanyakumari.jpg', 2560, 1905, 'Gandhi Memorial Mandapam'),
  sunset: P('Sun-Set-Point.jpg', 2560, 1905, 'Sunset Point, Kanyakumari'),
};

// Enlarged with Real-ESRGAN x4 from the low-resolution originals (all others are the hotel's own HD files).
export const UPSCALED = ['roomStandard', 'roomCorner', 'roomTwin', 'roomSuite', 'lobby', 'dining', 'meeting', 'vivekananda', 'thiruvalluvar', 'beach', 'gandhi', 'sunset'];

// A photo reference is either a built-in key above (e.g. 'roomDeluxe') or 'm:<id>' for a photo uploaded
// in the admin panel (served by /api/media/<id>). Unknown references return null, so nothing broken shows.
export const isMedia = (ref) => typeof ref === 'string' && ref.startsWith('m:');
export const mediaSrc = (ref) => `/api/media/${ref.slice(2)}`;

export function photo(ref) {
  if (!ref) return null;
  if (isMedia(ref)) return { src: mediaSrc(ref), width: 1920, height: 1280, alt: '' };
  return PHOTOS[ref] || null;
}

// Absolute URL for structured data and social previews.
export const photoUrl = (ref, site) => {
  const p = photo(ref);
  return p ? `${site}${p.src}` : null;
};
