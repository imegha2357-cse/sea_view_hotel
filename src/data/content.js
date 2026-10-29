// All hotel facts below are taken from the current hotelseaview.in pages and rewritten.
// Items marked CONFIRM need client approval before launch (PRD sections 11 and 15).

export const HOTEL = {
  name: 'Hotel Sea View',
  shortName: 'Sea View',
  city: 'Kanyakumari',
  addressLines: ['East Car Street', 'Kanyakumari, Tamil Nadu 629 702', 'India'],
  phone: '+91 94894 74968',
  phoneHref: '+919489474968',
  whatsapp: '919489474968',
  restaurantPhone: '+91 76959 59109',
  restaurantPhoneHref: '+917695959109',
  email: 'sales@hotelseaview.in',
  facebook: 'https://www.facebook.com/hotelseaviewkanyakumari',
  mapQuery: 'Hotel Sea View, East Car Street, Kanyakumari, Tamil Nadu 629702',
  // CONFIRM: check-in / check-out times are not published on the current site.
  checkIn: null,
  checkOut: null,
};

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL.mapQuery)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(HOTEL.mapQuery)}&output=embed`;

export const ABOUT = {
  eyebrow: 'Welcome to Hotel Sea View',
  title: 'Sunrise over the sea, from the heart of Kanyakumari',
  body: [
    'Hotel Sea View stands on East Car Street, close to the beach and a few minutes from the Kanyakumari bus terminus. Several rooms look out over the sea towards the Vivekananda Rock Memorial and the Thiruvalluvar Statue, so you can watch the sunrise without leaving your room.',
    'Every room has a private bathroom, television and direct-dial telephone, with room service around the clock. Our travel desk arranges sightseeing and package tours across the region.',
  ],
  highlights: [
    { title: 'Sunrise views', text: 'Sea-facing rooms look towards the Vivekananda Rock Memorial and Thiruvalluvar Statue.' },
    { title: 'Near the beach', text: 'Walk to the shore; the bus terminus is a few minutes away.' },
    { title: '24-hour room service', text: 'Meals and help at any hour of the day or night.' },
    { title: 'Travel desk', text: 'Sightseeing and package tours arranged by our team.' },
  ],
};

export const ROOMS = [
  {
    id: 'standard',
    name: 'Standard Room',
    image: 'roomStandard',
    view: 'City view',
    tags: ['city'],
    summary: 'Wooden furnishings, a work area and views over the town as the evening lights come on.',
    beds: 'King or twin',
    occupancy: '2 adults + 2 children under 6',
    size: '300 sq ft',
    features: ['Private bathroom', 'Television', 'Direct-dial phone', 'Work area'],
    rate: null, // CONFIRM: 'from' price per night in rupees, e.g. 2500
  },
  {
    id: 'deluxe-seaview',
    name: 'Deluxe Seaview Room',
    image: 'roomDeluxe',
    view: 'Sea view',
    tags: ['sea'],
    summary: 'Our classic sea-facing room. Look straight out to the Vivekananda Rock Memorial and the Thiruvalluvar Statue, and watch the sunrise without leaving your bed.',
    beds: 'King or twin',
    occupancy: '2 adults + 2 children under 6',
    size: null, // CONFIRM room size
    features: ['Faces the island memorials', 'Sunrise from the bed', 'Private bathroom', 'Television', 'Work area'],
    rate: null, // CONFIRM 'from' price per night
  },
  {
    id: 'corner-deluxe',
    name: 'Corner Deluxe Room',
    image: 'roomCorner',
    view: 'Sea view',
    tags: ['sea'],
    summary: 'Set on a corner of the building on the sunrise side, looking out over the sea.',
    beds: 'King or twin',
    occupancy: '2 adults + 2 children under 6',
    size: null, // CONFIRM room size and a distinct description
    features: ['Corner position', 'Sea view on the sunrise side', 'Private bathroom', 'Television'],
    rate: null, // CONFIRM 'from' price per night
  },
  {
    id: 'twin',
    name: 'Twin Room (interconnected)',
    image: 'roomTwin',
    view: 'Sea and city view',
    tags: ['sea', 'family'],
    summary: 'Two interconnected rooms for families staying together. One balcony faces the sea and sunrise; the other overlooks the town.',
    beds: 'King or twin',
    occupancy: '4 adults + 4 children under 6',
    size: null, // CONFIRM room size
    features: ['Two balconies', 'Interconnecting door', 'Sea and city views'],
    rate: null, // CONFIRM 'from' price per night
  },
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    image: 'roomSuite',
    view: 'Sea view',
    tags: ['sea'],
    summary: 'The hotel’s suite category: sea views across to the two island memorials, the sunrise from the bed, and a work area for longer stays.',
    beds: 'King or twin',
    occupancy: '2 adults + 2 children under 6',
    size: null, // CONFIRM room size
    features: ['Suite', 'Sea views to the island memorials', 'Sunrise from the bed', 'Work area'],
    rate: null, // CONFIRM 'from' price per night
  },
];

export const ROOM_TYPES = ROOMS.map((r) => r.name);

// Rates are enquiry-only until the client confirms the rate-display decision (PRD 15).
export const RATE_NOTE = 'Rates depend on dates and availability. Send an enquiry and we will reply with prices.';

export const FACILITIES = [
  { icon: 'parking', label: 'Free parking' },
  { icon: 'wifi', label: 'Wi-Fi' },
  { icon: 'breakfast', label: 'Daily breakfast' },
  { icon: 'bell', label: '24-hour room service' },
  { icon: 'laundry', label: 'Laundry service' },
  { icon: 'ac', label: 'Air-conditioned restaurant' },
  { icon: 'map', label: 'Travel desk and tours' },
  { icon: 'sun', label: 'Sunrise views' },
];

export const EXPERIENCES = [
  {
    id: 'restaurant',
    tab: 'Restaurant',
    title: 'Sea View Restaurant',
    images: ['restaurant1', 'restaurant2'],
    text: 'A fully air-conditioned, multi-cuisine restaurant serving Indian, Chinese and Continental dishes, with vegetarian and non-vegetarian menus.',
    details: ['Indian, Chinese and Continental', 'Vegetarian and non-vegetarian', `Reservations: +91 76959 59109`],
  },
  {
    id: 'bar',
    tab: 'Wave Bar',
    title: 'Wave Bar',
    images: ['bar1', 'bar2'],
    text: 'Unwind with a drink before dinner or a nightcap after a day of sightseeing. A snack menu is served alongside.',
    details: ['Wines, spirits and cocktails', 'Snack menu'], // CONFIRM opening hours
  },
  {
    id: 'meetings',
    tab: 'Meetings',
    title: 'Conference Hall',
    images: ['meeting'],
    text: 'A meeting room for business gatherings and family events, with our team on hand to look after the details.',
    details: ['Meetings and small events', 'Catering from our restaurant'], // CONFIRM capacity and equipment
  },
];

export const ATTRACTIONS = [
  { name: 'Vivekananda Rock Memorial', image: 'vivekananda', text: 'The island memorial and its glass bridge, reached by ferry from the shore.' },
  { name: 'Thiruvalluvar Statue', image: 'thiruvalluvar', text: 'The tall stone statue of the Tamil poet beside the rock memorial.' },
  { name: 'Kanyakumari Beach', image: 'beach', text: 'Where three seas meet, near the hotel.' },
  { name: 'Gandhi Memorial Mandapam', image: 'gandhi', text: 'Memorial hall on the seafront.' },
  { name: 'Sunset Point', image: 'sunset', text: 'A favourite spot to watch the evening sky.' },
];

export const GALLERY = [
  { image: 'building', cat: 'Hotel' },
  { image: 'roomDeluxe', cat: 'Rooms' },
  { image: 'vivekananda', cat: 'Views' },
  { image: 'lobby', cat: 'Hotel' },
  { image: 'restaurant1', cat: 'Dining' },
  { image: 'roomSuite', cat: 'Rooms' },
  { image: 'thiruvalluvar', cat: 'Views' },
  { image: 'entrance', cat: 'Hotel' },
  { image: 'bar1', cat: 'Dining' },
  { image: 'roomCorner', cat: 'Rooms' },
  { image: 'sunset', cat: 'Views' },
  { image: 'dining', cat: 'Dining' },
  { image: 'roomTwin', cat: 'Rooms' },
  { image: 'meeting', cat: 'Hotel' },
  { image: 'beach', cat: 'Views' },
  { image: 'restaurant2', cat: 'Dining' },
  { image: 'roomStandard', cat: 'Rooms' },
  { image: 'bar2', cat: 'Dining' },
  { image: 'gandhi', cat: 'Views' },
];

// "Our benefits" from the original site, rewritten. Templated claims (e.g. "historical luxury") removed.
export const AMENITIES = [
  { icon: 'rings', title: 'Weddings and events', text: 'Our conference hall and restaurant host family functions, meetings and celebrations.', link: '/meetings' },
  { icon: 'umbrella', title: 'Beach location', text: 'Stay near the shore where three seas meet.', link: '/plan-your-visit' },
  { icon: 'dish', title: 'Restaurant', text: 'Indian, Chinese and Continental dishes, vegetarian and non-vegetarian.', link: '/dining#restaurant' },
  { icon: 'glass', title: 'Wave Bar', text: 'A drink before dinner or a nightcap after a day of sightseeing.', link: '/dining#bar' },
];

export const HIGHLIGHTS = [
  { title: 'Comfortable rooms', image: 'roomDeluxe', text: 'Five room types, from city-view Standard Rooms to the Executive Suite, each with a private bathroom and TV.' },
  { title: 'Prime location', image: 'building', text: 'On East Car Street, close to the beach and a few minutes from the Kanyakumari bus terminus.' },
  { title: 'Safe pick and drop', image: 'entrance', text: 'Ask our travel desk to arrange your transfer from the station, bus stand or airport.' },
  { title: 'Quality room service', image: 'dining', text: 'Meals and help at any hour, around the clock.' },
];

// Verified facts only (PRD 10.1). The old site's visitor counts were unverified and are not used.
export const FACTS = [
  { value: 3, label: 'Seas meet at the shore' },
  { value: 5, label: 'Room types' },
  { value: 24, label: 'Hour room service' },
];

// For the sunrise and sunset times shown in the hero
export const GEO = { lat: 8.0883, lon: 77.5385, tzHours: 5.5 };

export const FAQS = [
  { q: 'How do I book a room?', a: 'Send an enquiry on this page or message us on WhatsApp. Our team confirms availability, price and booking terms with you directly. The website does not confirm reservations by itself.' },
  { q: 'Is parking available?', a: 'Yes. Parking is free for hotel guests.' },
  { q: 'Which rooms have a sea view?', a: 'The Deluxe Seaview Room, Corner Deluxe Room, Executive Suite and one side of the interconnected Twin Room face the sea and the sunrise.' },
  { q: 'Is room service available at night?', a: 'Yes. Room service runs 24 hours a day.' },
  { q: 'Can you arrange sightseeing?', a: 'Our travel desk arranges local sightseeing and package tours. Ask at reception or mention it in your enquiry.' },
  { q: 'Can you arrange a pick-up from the station, bus stand or airport?', a: 'Yes. Our travel desk can arrange a pick-up or drop from Kanyakumari railway station, the bus terminus or Thiruvananthapuram airport. Ask when you enquire and we will confirm the cost.' },
  { q: 'Can I see the sunrise from my room?', a: 'Yes, from our sea-facing rooms: the Deluxe Seaview Room, Corner Deluxe Room, Executive Suite and the sea side of the interconnected Twin Room look out towards the sunrise.' },
  { q: 'Do you have a restaurant and bar?', a: 'Yes. Sea View Restaurant serves Indian, Chinese and Continental food, vegetarian and non-vegetarian, and the Wave Bar is open for drinks. Room service runs 24 hours a day.' },
  { q: 'Can we hold a wedding, meeting or family function?', a: 'Yes. Our conference hall hosts meetings, training and family functions, with catering from our restaurant and rooms for your guests. Tell us the date and numbers and we will confirm availability.' },
  // CONFIRM and add: check-in / check-out times, cancellation policy, child policy, pets.
];

// WS-09: only client-approved testimonials, published with the guest's permission and accurate attribution.
// The section stays hidden while this list is empty. Add entries in this shape:
// { quote: 'Exact approved words of the guest.', name: 'Guest name or initials', from: 'City', date: 'Month Year', source: 'Google review' }
export const TESTIMONIALS = [];

// Room mosaic (rooms page and home): text tiles introduce each group, photo tiles show each room.
export const ROOM_GROUPS = [
  {
    title: 'Sea-view rooms',
    text: 'Rooms on the sea side of the hotel, facing the Vivekananda Rock Memorial and the Thiruvalluvar Statue. The sunrise comes to you.',
    rooms: ['deluxe-seaview', 'corner-deluxe', 'executive-suite'],
    textFirst: true,
  },
  {
    title: 'City and family rooms',
    text: 'Standard Rooms look over the town, and the interconnected Twin Rooms keep families together, with one balcony facing the sea.',
    rooms: ['standard', 'twin'],
    textFirst: false,
    extra: { title: 'Room tour', meta: 'Watch the 73-second video', href: '/room-tour', image: 'tourPoster' },
  },
];

export const ENQUIRY_STATUSES = ['New', 'Contacted', 'Availability Checked', 'Awaiting Guest', 'Confirmed', 'Cancelled', 'Closed'];

export const VIDEO = {
  tour: '/media/room-tour.mp4',
  tourPoster: '/media/room-tour-poster.jpg',
  heroImage: '/media/sea-loop-poster.jpg',
  duration: '1:13',
};


// Features #5/#55: offers and promo codes. The offers block and code field appear only when this list has entries.
// Shape: { code: 'HONEYMOON', title: 'Honeymoon stay', text: 'Room decoration and a sea-view room', valid: 'Until 31 Mar 2027' }
// Offers and packages (feature #5/#55). Each one is built only from services the hotel already
// publishes; none promises a price or a discount. CONFIRM every offer with the hotel before launch,
// and add a rate or a "valid until" date when they approve one.
export const OFFERS = [
  {
    code: 'SUNRISE',
    title: 'Sunrise sea-view stay',
    image: 'seaView',
    tag: 'Most asked for',
    text: 'A sea-facing room looking out to the Vivekananda Rock Memorial and the Thiruvalluvar Statue, so the sunrise comes to your window.',
    includes: ['Deluxe Seaview, Corner Deluxe or Executive Suite', 'Next morning’s sunrise time shared at check-in', 'Travel desk help with the ferry to the rock memorial'],
    room: 'Deluxe Seaview Room',
  },
  {
    code: 'FAMILY',
    title: 'Family together',
    image: 'roomTwin',
    tag: 'Families',
    text: 'Two interconnected rooms with a door between them: everyone close, everyone with their own space. One balcony faces the sea.',
    includes: ['Interconnected Twin Rooms', 'Sleeps 4 adults and 4 children under 6', '24-hour room service'],
    room: 'Twin Room (interconnected)',
  },
  {
    code: 'EXPLORE',
    title: 'Stay and sightseeing',
    image: 'vivekananda',
    tag: 'With our travel desk',
    text: 'Your room plus a sightseeing plan from our travel desk: the island memorials, the Gandhi Memorial Mandapam, the beach and Sunset Point.',
    includes: ['Any room type', 'Sightseeing tour arranged by our travel desk', 'Pick-up from the station or bus stand on request'],
  },
  {
    code: 'LONGSTAY',
    title: 'Longer stays',
    image: 'roomSuite',
    tag: '4 nights or more',
    text: 'Staying four nights or more? Tell us your dates and ask our team for a rate for a longer stay.',
    includes: ['Any room type', 'Rate quoted for your dates', 'Restaurant and 24-hour room service on site'],
  },
  {
    code: 'MEET',
    title: 'Meeting and stay',
    image: 'meeting',
    tag: 'Business',
    text: 'Hold your meeting or training in our conference hall, with catering from Sea View Restaurant and rooms for people travelling in.',
    includes: ['Conference hall', 'Catering from Sea View Restaurant', 'Rooms for attendees'],
    type: 'meeting',
  },
];

// Events we host (feature #6). Capacities and menus are confirmed on enquiry.
export const EVENT_TYPES = [
  { id: 'weddings', icon: 'rings', title: 'Weddings and receptions', text: 'Celebrate by the sea, with catering from our restaurant and rooms for family travelling in.', type: 'event' },
  { id: 'engagements', icon: 'heart', title: 'Engagements', text: 'A ceremony and a meal for both families, planned with our team from the first call.', type: 'event' },
  { id: 'birthdays', icon: 'cake', title: 'Birthdays and anniversaries', text: 'A private celebration for family and friends, with food from Sea View Restaurant.', type: 'event' },
  { id: 'reunions', icon: 'people', title: 'Family get-togethers', text: 'Bring the whole family together, with interconnected rooms and the hall for meals.', type: 'event' },
  { id: 'meetings', icon: 'table', title: 'Business meetings', text: 'Board and team meetings in the conference hall, with tea breaks and lunch served.', type: 'meeting' },
  { id: 'training', icon: 'board', title: 'Training and seminars', text: 'Workshops and training days, with rooms for out-of-town participants.', type: 'meeting' },
  { id: 'groups', icon: 'bus', title: 'Tour and pilgrimage groups', text: 'Rooms for groups visiting Kanyakumari, with meals and sightseeing from our travel desk.', type: 'event' },
  { id: 'dining-events', icon: 'dish', title: 'Private lunches and dinners', text: 'A set menu for your guests from our Indian, Chinese and Continental kitchen.', type: 'event' },
];

export const EVENT_STEPS = [
  { title: 'Tell us the occasion', text: 'Date, number of guests and what you have in mind.' },
  { title: 'We check the hall and rooms', text: 'Our team confirms availability, usually the same day.' },
  { title: 'Plan the menu and setup', text: 'Choose dishes and the layout with our restaurant team.' },
  { title: 'Confirm and relax', text: 'We look after the details on the day.' },
];

// Short travel guides (feature #54): general advice only, no timings that change by season.
export const GUIDES = [
  {
    slug: 'sunrise-in-kanyakumari',
    title: 'Seeing the sunrise in Kanyakumari',
    image: 'seaView',
    summary: 'Where to watch the sun come up over the sea, when to be there and what to expect.',
    body: [
      ['p', 'Kanyakumari sits at the southern tip of India, where the Arabian Sea, the Bay of Bengal and the Indian Ocean meet. On a clear morning the sun rises straight out of the sea, with the Vivekananda Rock Memorial and the Thiruvalluvar Statue in front of it.'],
      ['h2', 'Where to watch'],
      ['p', 'The shore near the hotel is the classic spot, and it fills up early. From our sea-facing rooms (Deluxe Seaview, Corner Deluxe and the Executive Suite) you can watch from your window instead.'],
      ['h2', 'When to be there'],
      ['p', 'Sunrise in Kanyakumari is a little after 6 am for most of the year. Be in place 15 minutes before: the sky starts to colour well before the sun appears. Our Plan your visit page shows the exact time for any date.'],
      ['h2', 'What to expect'],
      ['p', 'Clouds over the sea can hide the sun, more often during the monsoon months. If one morning is cloudy, try the next. The evening sunset at Sunset Point is the other half of the Kanyakumari day.'],
    ],
  },
  {
    slug: 'best-time-to-visit-kanyakumari',
    title: 'The best time to visit Kanyakumari',
    image: 'beach',
    summary: 'What the weather is like through the year, and how to plan around it.',
    body: [
      ['p', 'Kanyakumari is warm all year. The difference between seasons is mostly about heat, humidity and rain.'],
      ['h2', 'October to March'],
      ['p', 'The most comfortable months, with milder days and pleasant evenings for the beach and Sunset Point. This is also the busiest time, so send your enquiry early, especially for holidays and long weekends.'],
      ['h2', 'April and May'],
      ['p', 'The hottest months. Sightseeing is best in the early morning and late afternoon, with a rest in the middle of the day.'],
      ['h2', 'June to September'],
      ['p', 'Monsoon months bring breezes, showers and a greener coast. The sea can be rough, and boats to the rock memorial may pause on stormy days, so keep a spare morning in your plan.'],
      ['h2', 'Plan with us'],
      ['p', 'Our Plan your visit page has sunrise times, the week’s weather forecast and how to reach Kanyakumari. Our travel desk can suggest a plan for your dates.'],
    ],
  },
];

// Feature #16: link guests to the hotel's Google reviews after their stay. CONFIRM and paste the review link.
export const GOOGLE_REVIEW_URL = null;

// Feature #29: only facts the hotel has published are stated; the rest say "please ask".
export const POLICIES = [
  { title: 'Check-in and check-out', text: 'Times to be confirmed by the hotel. Please ask when you enquire.', confirmed: false },
  { title: 'Parking', text: 'Free parking for hotel guests.', confirmed: true },
  { title: 'Room service', text: 'Available 24 hours a day.', confirmed: true },
  { title: 'Children', text: 'Standard rooms sleep 2 adults and 2 children under 6. Ask us about older children.', confirmed: true },
  { title: 'Cancellation', text: 'Cancellation terms are confirmed with your booking. Please ask before you pay.', confirmed: false },
  { title: 'Identity documents', text: 'Please carry a government photo ID for every adult guest.', confirmed: false },
  { title: 'Pets', text: 'Please ask the hotel before travelling with a pet.', confirmed: false },
];

// Feature #28: the conference hall. CONFIRM capacity, layouts and equipment.
export const MEETINGS = {
  title: 'Conference hall',
  image: 'meeting',
  text: 'A meeting room for business gatherings, training sessions and family functions, with catering from Sea View Restaurant.',
  facts: ['Meetings, training and small functions', 'Catering from our multi-cuisine restaurant', 'Rooms for out-of-town attendees', 'Capacity and equipment: please ask'],
};

// Feature #69: getting here. Distances are not stated until verified.
export const HOW_TO_REACH = [
  { mode: 'By train', text: 'Kanyakumari railway station serves the town. Our travel desk can arrange a pick-up.' },
  { mode: 'By bus', text: 'The hotel is a few minutes from the Kanyakumari bus terminus.' },
  { mode: 'By air', text: 'The nearest airport is Thiruvananthapuram International Airport. Ask us to arrange a transfer.' },
  { mode: 'By road', text: 'We are on East Car Street. Free parking is available for guests.' },
];

// Feature #64: suggested plans built from the landmarks near the hotel. Ask the travel desk for timings.
export const ITINERARIES = [
  {
    title: 'One day at the tip of India',
    steps: [
      { time: 'Sunrise', text: 'Watch the sun come up over the sea from a sea-facing room or the shore.' },
      { time: 'Morning', text: 'Take the ferry to the Vivekananda Rock Memorial and the Thiruvalluvar Statue.' },
      { time: 'Midday', text: 'Lunch at Sea View Restaurant: Indian, Chinese or Continental.' },
      { time: 'Afternoon', text: 'Visit the Gandhi Memorial Mandapam and walk along Kanyakumari Beach.' },
      { time: 'Evening', text: 'Watch the sunset from Sunset Point, then dinner back at the hotel.' },
    ],
  },
  {
    title: 'Two relaxed days',
    steps: [
      { time: 'Day 1', text: 'Arrive, settle in, sunset at Sunset Point and the beach in the evening.' },
      { time: 'Day 2 morning', text: 'Sunrise from your room, then the ferry to the island memorials.' },
      { time: 'Day 2 afternoon', text: 'Gandhi Memorial Mandapam, local shopping, and a sightseeing tour from our travel desk.' },
    ],
  },
];

// Home page "Highlights" carousel (image card on a blurred backdrop, in the style of the Taj reference).
// Every line is a published fact about the hotel; nothing here is a ranking or award.
export const HIGHLIGHT_SLIDES = [
  { title: 'Sunrise from your room', image: 'roomCorner', text: 'Sea-facing rooms look out towards the Vivekananda Rock Memorial and the Thiruvalluvar Statue, so the sunrise comes to you.', href: '/rooms', cta: 'Sea-view rooms' },
  { title: 'Deluxe Seaview Room', image: 'roomDeluxe', text: 'Watch the sun come up over the sea from your bed, with a private bathroom, television and work area.', href: '/rooms/deluxe-seaview', cta: 'View the room' },
  { title: 'Sea View Restaurant', image: 'restaurant1', text: 'A fully air-conditioned, multi-cuisine restaurant serving Indian, Chinese and Continental dishes, vegetarian and non-vegetarian.', href: '/dining#restaurant', cta: 'Dining' },
  { title: 'Wave Bar', image: 'bar1', text: 'A drink before dinner or a nightcap after a day of sightseeing, with a snack menu alongside.', href: '/dining#bar', cta: 'Wave Bar' },
  { title: 'Conference hall', image: 'meeting', text: 'Meetings, training sessions and family functions, with catering from our restaurant and rooms for your guests.', href: '/meetings', cta: 'Meetings and events' },
  { title: 'Travel desk', image: 'vivekananda', text: 'Our team arranges sightseeing and package tours, from the island memorials to the rest of the region.', href: '/experiences', cta: 'Experiences' },
  { title: '24-hour room service', image: 'dining', text: 'Meals and help at any hour of the day or night.', href: '/dining#room-service', cta: 'Room service' },
];

export const HERO_SLIDES = [
  { image: 'vivekananda', caption: 'Vivekananda Rock Memorial, a short ferry ride away' },
  { image: 'building', caption: 'Hotel Sea View, East Car Street' },
  { image: 'roomDeluxe', caption: 'Deluxe Seaview Room' },
  { image: 'restaurant1', caption: 'Sea View Restaurant' },
];

export const OVERVIEW = {
  eyebrow: 'Welcome',
  title: 'Sunrise at the tip of India',
  short:
    'Hotel Sea View stands on East Car Street in Kanyakumari, close to the beach where three seas meet and a few minutes from the bus terminus.',
  more: [
    'Several rooms look out over the sea towards the Vivekananda Rock Memorial and the Thiruvalluvar Statue, so you can watch the sunrise without leaving your room.',
    'Every room has a private bathroom, television and direct-dial telephone, with room service around the clock. Sea View Restaurant serves Indian, Chinese and Continental food, the Wave Bar is open for a drink in the evening, and our travel desk arranges sightseeing across the region.',
  ],
};
