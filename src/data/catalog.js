// Shared lists used by the admin panel and the public site.

// In-room amenities the admin can tick for each room type. Icons come from components/Icons.jsx.
export const AMENITY_CATALOG = [
  { id: 'sea_view', label: 'Sea view', icon: 'waves' },
  { id: 'sunrise', label: 'Sunrise view', icon: 'sun' },
  { id: 'city_view', label: 'City view', icon: 'pin' },
  { id: 'bathroom', label: 'Private bathroom', icon: 'bath' },
  { id: 'tv', label: 'Television', icon: 'tv' },
  { id: 'phone', label: 'Direct-dial phone', icon: 'phone' },
  { id: 'room_service', label: '24-hour room service', icon: 'bell' },
  { id: 'work_area', label: 'Work area', icon: 'desk' },
  { id: 'balcony', label: 'Balcony', icon: 'balcony' },
  { id: 'interconnecting', label: 'Interconnecting door', icon: 'door' },
  { id: 'ac', label: 'Air-conditioning', icon: 'ac' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { id: 'hot_water', label: 'Hot water', icon: 'bath' },
  { id: 'laundry', label: 'Laundry service', icon: 'laundry' },
  { id: 'breakfast', label: 'Breakfast available', icon: 'breakfast' },
  { id: 'parking', label: 'Free parking', icon: 'parking' },
];
export const amenity = (id) => AMENITY_CATALOG.find((a) => a.id === id);

// Page banners the admin can change, with the photo each page uses until then.
export const BANNER_SLOTS = [
  { id: 'rooms', label: 'Rooms and suites', fallback: 'roomDeluxe' },
  { id: 'dining', label: 'Dining', fallback: 'restaurant1' },
  { id: 'experiences', label: 'Experiences', fallback: 'vivekananda' },
  { id: 'offers', label: 'Offers', fallback: 'sunset' },
  { id: 'meetings', label: 'Meetings and events', fallback: 'meeting' },
  { id: 'gallery', label: 'Gallery', fallback: 'building' },
  { id: 'about', label: 'About', fallback: 'building' },
  { id: 'contact', label: 'Contact', fallback: 'entrance' },
  { id: 'policies', label: 'Policies', fallback: 'entrance' },
  { id: 'plan', label: 'Plan your visit', fallback: 'sunset' },
  { id: 'guides', label: 'Guides', fallback: 'beach' },
];

export const GALLERY_CATEGORIES = ['Hotel', 'Rooms', 'Dining', 'Views'];

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
