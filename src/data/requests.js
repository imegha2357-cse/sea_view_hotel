// The website's request forms. Each one is saved to Firestore (requests/{id}, staff see it under
// Hotel → Requests) and then opens WhatsApp with the same details, so nothing is lost if the
// database is unreachable. Field: { key, label, type: text|number|date|time|select|textarea, options?, required? }
const DATES = [
  { key: 'check_in', label: 'Arrival date', type: 'date', required: true },
  { key: 'check_out', label: 'Departure date', type: 'date' },
];
export const REQUEST_FORMS = {
  group: {
    title: 'Group and pilgrim bookings',
    intro: 'Tour groups, pilgrim groups, school trips and large families. Tell us your dates and numbers and our team will reply with room options and a quote.',
    image: 'frontNight',
    fields: [...DATES, { key: 'people', label: 'Number of people', type: 'number', required: true }, { key: 'rooms', label: 'Rooms needed (if known)', type: 'number' }, { key: 'group_type', label: 'Type of group', type: 'select', options: ['Pilgrim group', 'Tour group', 'School or college', 'Family', 'Wedding party', 'Other'] }, { key: 'meals', label: 'Meals', type: 'select', options: ['Not needed', 'Breakfast only', 'All meals (vegetarian)', 'All meals (mixed)'] }, { key: 'bus', label: 'Coming by', type: 'select', options: ['Bus / coach (needs parking)', 'Train', 'Cars', 'Not sure yet'] }],
  },
  corporate: {
    title: 'Corporate stays',
    intro: 'Staff travel, conferences and team trips. Give us an idea of your needs and we will send a corporate quote.',
    image: 'conferenceTheatre',
    fields: [{ key: 'company', label: 'Company', type: 'text', required: true }, { key: 'gst', label: 'GST number (for invoice, optional)', type: 'text' }, ...DATES, { key: 'people', label: 'Number of guests', type: 'number' }, { key: 'hall', label: 'Need the conference hall?', type: 'select', options: ['No', 'Yes, half day', 'Yes, full day', 'Yes, several days'] }, { key: 'frequency', label: 'How often', type: 'select', options: ['One-time', 'Every month', 'Several times a year'] }],
  },
  gift: {
    title: 'Gift a stay',
    intro: 'Give someone a sunrise in Kanyakumari. Tell us who it is for; our team will confirm the price, take payment directly and send a gift voucher.',
    image: 'roomCornerView',
    fields: [{ key: 'for_name', label: 'Who is it for?', type: 'text', required: true }, { key: 'occasion', label: 'Occasion', type: 'select', options: ['Birthday', 'Anniversary', 'Wedding gift', 'Retirement', 'Thank you', 'Other'] }, { key: 'nights', label: 'Nights', type: 'number' }, { key: 'room', label: 'Room', type: 'room' }, { key: 'note', label: 'Message on the voucher', type: 'text' }],
  },
  tour: {
    title: 'Sightseeing and taxi',
    intro: 'Our travel desk arranges station and airport transfers, local sightseeing and day trips to Suchindram, Padmanabhapuram, Thiruvananthapuram and more.',
    image: 'vivekananda',
    fields: [{ key: 'service', label: 'What do you need?', type: 'select', required: true, options: ['Kanyakumari local sightseeing', 'Day trip', 'Railway station pick-up', 'Trivandrum airport transfer', 'Madurai transfer', 'Other'] }, { key: 'date', label: 'Date', type: 'date', required: true }, { key: 'time', label: 'Time', type: 'time' }, { key: 'people', label: 'People', type: 'number' }, { key: 'vehicle', label: 'Vehicle', type: 'select', options: ['Any', 'Sedan (4)', 'SUV (6–7)', 'Tempo traveller (12+)'] }],
  },
  table: {
    title: 'Reserve a table',
    intro: 'Reserve a table at Sea View Restaurant. Our team will confirm on WhatsApp or by phone.',
    image: 'restaurant1',
    fields: [{ key: 'date', label: 'Date', type: 'date', required: true }, { key: 'time', label: 'Time', type: 'time', required: true }, { key: 'people', label: 'People', type: 'number', required: true }, { key: 'meal', label: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner'] }, { key: 'staying', label: 'Staying at the hotel?', type: 'select', options: ['No', 'Yes'] }],
  },
  celebration: {
    title: 'Birthday and anniversary set-ups',
    intro: 'Cake, flowers, balloons or room decoration for a birthday, anniversary or proposal. Tell us what you have in mind; our team will confirm what is possible and the cost.',
    image: 'roomDeluxe',
    fields: [{ key: 'occasion', label: 'Occasion', type: 'select', required: true, options: ['Birthday', 'Anniversary', 'Proposal', 'Honeymoon', 'Other'] }, { key: 'date', label: 'Date', type: 'date', required: true }, { key: 'wish', label: 'What would you like?', type: 'select', options: ['Cake', 'Room decoration', 'Cake and decoration', 'Dinner set-up', 'Not sure, suggest something'] }, { key: 'booked', label: 'Already booked a room?', type: 'select', options: ['Yes', 'Not yet'] }],
  },
  agent: {
    title: 'Travel agents and tour operators',
    intro: 'Send us your agency details and our sales team will contact you about agent rates and group allotments.',
    image: 'lobbyEntrance',
    fields: [{ key: 'agency', label: 'Agency name', type: 'text', required: true }, { key: 'city', label: 'City', type: 'text', required: true }, { key: 'iata', label: 'IATA / licence number (optional)', type: 'text' }, { key: 'volume', label: 'Room nights per year (estimate)', type: 'select', options: ['Under 50', '50–200', '200–500', 'Over 500'] }, { key: 'website', label: 'Website', type: 'text' }],
  },
  callback: {
    title: 'Request a call back',
    intro: 'Leave your number and a good time, and our team will call you.',
    image: 'lounge',
    fields: [{ key: 'when', label: 'Best time to call', type: 'select', required: true, options: ['Any time', 'Morning (9 am – 12 pm)', 'Afternoon (12 – 4 pm)', 'Evening (4 – 8 pm)'] }, { key: 'about', label: 'About', type: 'select', options: ['Room booking', 'Group booking', 'Event or wedding', 'Sightseeing', 'Something else'] }, { key: 'language', label: 'Language', type: 'select', options: ['English', 'Tamil', 'Malayalam', 'Hindi'] }],
  },
};
export const STAY_REQUESTS = ['Extra towels', 'Extra pillow or blanket', 'Drinking water', 'Room cleaning', 'Late check-out', 'Wake-up call', 'Something is not working', 'Taxi', 'Other'];
export const REQUEST_SLUGS = Object.keys(REQUEST_FORMS);
