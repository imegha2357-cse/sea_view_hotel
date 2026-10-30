// The website's request forms. Each one is saved to Firestore (requests/{id}, staff see it under
// Hotel → Requests) and then opens WhatsApp with the same details, so nothing is lost if the
// database is unreachable. Field: { key, label, type: text|number|date|time|select|textarea, options?, required? }
const DATES = [
  { key: 'check_in', label: 'Arrival date', type: 'date', required: true },
  { key: 'check_out', label: 'Departure date', type: 'date' },
];
export const REQUEST_FORMS = {
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
};
export const STAY_REQUESTS = ['Extra towels', 'Extra pillow or blanket', 'Drinking water', 'Room cleaning', 'Late check-out', 'Wake-up call', 'Something is not working', 'Taxi', 'Other'];
export const REQUEST_SLUGS = Object.keys(REQUEST_FORMS);
