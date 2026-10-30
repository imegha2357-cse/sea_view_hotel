// Simple lists the hotel manages from the admin panel (Website → Lists). Each list is stored in
// Firestore at lists/{id} as { items: [...] }. Nothing is shown on the website until staff add
// entries, so the site never shows invented menus, reviews, awards or timings.
export const LISTS = [
  {
    id: 'menu',
    title: 'Restaurant menu',
    itemLabel: 'dish',
    help: 'Dishes shown on the Dining menu page. Leave the price empty if you prefer guests to ask.',
    fields: [
      { key: 'name', label: 'Dish', required: true, max: 80 },
      { key: 'section', label: 'Section', type: 'select', options: ['Breakfast', 'Starters', 'Mains', 'Breads and rice', 'Desserts', 'Drinks'] },
      { key: 'diet', label: 'Type', type: 'select', options: ['Veg', 'Non-veg', 'Egg', 'Vegan', 'Jain'] },
      { key: 'price', label: 'Price (₹, optional)', max: 12 },
      { key: 'note', label: 'Short description', max: 160 },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
  {
    id: 'timings',
    title: 'Local timings',
    itemLabel: 'timing',
    help: 'Opening hours of nearby places (ferry, temples, museums). Shown on Plan your visit. Check them with the source before saving.',
    fields: [
      { key: 'place', label: 'Place', required: true, max: 80 },
      { key: 'hours', label: 'Hours', required: true, max: 120 },
      { key: 'note', label: 'Note (closed days, fees)', max: 200 },
      { key: 'checked', label: 'Checked on (date)', type: 'date' },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
  {
    id: 'festivals',
    title: 'Festivals and events',
    itemLabel: 'event',
    help: 'Upcoming festivals and events in Kanyakumari. Shown on Plan your visit until the date passes.',
    fields: [
      { key: 'name', label: 'Event', required: true, max: 80 },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'end', label: 'Ends (optional)', type: 'date' },
      { key: 'text', label: 'What happens', type: 'textarea', max: 400 },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
  {
    id: 'testimonials',
    title: 'Guest reviews',
    itemLabel: 'review',
    help: 'Only add real reviews a guest wrote (copy them from Google, TripAdvisor or a feedback card) and say where it came from.',
    fields: [
      { key: 'name', label: 'Guest name', required: true, max: 60 },
      { key: 'place', label: 'From (city)', max: 60 },
      { key: 'text', label: 'Review', type: 'textarea', required: true, max: 600 },
      { key: 'source', label: 'Source', type: 'select', options: ['Google', 'TripAdvisor', 'Booking.com', 'MakeMyTrip', 'Goibibo', 'Feedback card', 'Email', 'Other'] },
      { key: 'date', label: 'Date of stay', type: 'date' },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
  {
    id: 'awards',
    title: 'Awards and certificates',
    itemLabel: 'award',
    help: 'Real awards, ratings certificates or licences. Shown on the About page.',
    fields: [
      { key: 'title', label: 'Award', required: true, max: 100 },
      { key: 'by', label: 'Given by', max: 80 },
      { key: 'year', label: 'Year', max: 4 },
      { key: 'image', label: 'Photo of the certificate', type: 'photo' },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
  {
    id: 'policies',
    title: 'Hotel policies',
    itemLabel: 'policy',
    help: 'Your house rules (ID, children, pets, cancellation, smoking). Shown on the Policies page and used by the chat assistant.',
    fields: [
      { key: 'title', label: 'Policy', required: true, max: 80 },
      { key: 'text', label: 'Details', type: 'textarea', required: true, max: 800 },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
  {
    id: 'guest_photos',
    title: 'Guest photos',
    itemLabel: 'photo',
    help: 'Photos guests shared with permission. Shown on the Gallery page as "Through our guests\' eyes".',
    fields: [
      { key: 'image', label: 'Photo', type: 'photo', required: true },
      { key: 'by', label: 'Shared by', max: 60 },
      { key: 'caption', label: 'Caption', max: 120 },
      { key: 'permission', label: 'The guest agreed to this photo being shown', type: 'checkbox', required: true },
      { key: 'hidden', label: 'Hide from website', type: 'checkbox' },
    ],
  },
];

export const LIST_IDS = LISTS.map((l) => l.id);

export const THEMES = [
  ['none', 'No theme'],
  ['pongal', 'Pongal'],
  ['diwali', 'Diwali'],
  ['christmas', 'Christmas'],
  ['newyear', 'New Year'],
  ['onam', 'Onam'],
];

export const THEME_TEXT = {
  pongal: 'Happy Pongal from all of us at Hotel Sea View',
  diwali: 'Happy Diwali from all of us at Hotel Sea View',
  christmas: 'Merry Christmas from Hotel Sea View',
  newyear: 'Happy New Year from Hotel Sea View',
  onam: 'Happy Onam from Hotel Sea View',
};

export const REQUEST_TYPES = {
  group: 'Group or pilgrim booking',
  corporate: 'Corporate stay',
  gift: 'Gift a stay',
  tour: 'Sightseeing or taxi',
  table: 'Table reservation',
  celebration: 'Celebration set-up',
  agent: 'Travel agent',
  callback: 'Call me back',
  stay: 'During my stay',
};

export const HK_STATES = [
  ['clean', 'Clean'],
  ['dirty', 'Needs cleaning'],
  ['inspect', 'To inspect'],
  ['occupied', 'Occupied'],
  ['blocked', 'Out of order'],
];
