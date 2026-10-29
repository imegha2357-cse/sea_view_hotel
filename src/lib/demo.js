import { loadFirebase } from './firebase';

// 15 fictional enquiries for trying the staff dashboard. Every one is marked source: 'demo',
// uses example.com emails and obviously fake 90000 phone numbers, and can be removed in one click.
const PEOPLE = [
  ['Ananya Krishnan', 'Deluxe Seaview Room', 2, 0, 'New', 'Celebrating our anniversary, a sunrise-facing room please.', ''],
  ['Rahul Mehta', 'Executive Suite', 2, 1, 'Contacted', '', 'Called back; quoted suite rate, guest comparing dates.'],
  ['Fatima Sheikh', 'Twin Room (interconnected)', 4, 3, 'Confirmed', 'Two families travelling together.', 'Advance received by bank transfer.'],
  ['Arjun Nair', 'Standard Room', 1, 0, 'Availability Checked', 'Business trip, need early check-in.', 'Standard available; early check-in subject to occupancy.'],
  ['Priya Raman', 'Corner Deluxe Room', 2, 0, 'Awaiting Guest', 'Can you arrange the Vivekananda Rock ferry?', 'Sent rate and ferry timings on WhatsApp, waiting for reply.'],
  ['Joseph Thomas', 'Deluxe Seaview Room', 2, 2, 'New', 'Is breakfast included?', ''],
  ['Lakshmi Iyer', 'Executive Suite', 3, 0, 'Confirmed', 'Elderly parent, a lower floor if possible.', 'Allocated lift-side suite.'],
  ['Mohammed Rizwan', 'Standard Room', 2, 0, 'Cancelled', '', 'Guest changed travel plans.'],
  ['Sneha Patil', 'Deluxe Seaview Room', 2, 1, 'Contacted', 'Need pick-up from Kanyakumari station.', 'Shared taxi rate for station pick-up.'],
  ['Vikram Singh', 'Twin Room (interconnected)', 4, 2, 'New', 'Group of 6 for a temple tour.', ''],
  ['Deepa Menon', 'Corner Deluxe Room', 2, 0, 'Availability Checked', '', 'Corner room free for requested nights.'],
  ['Karthik Subramanian', 'Standard Room', 2, 0, 'Confirmed', 'Arriving late at night, around 11 pm.', 'Night manager informed of late arrival.'],
  ['Ayesha Khan', 'Deluxe Seaview Room', 2, 0, 'Awaiting Guest', 'Honeymoon, any special arrangement?', 'Offered flower decoration; awaiting confirmation.'],
  ['Suresh Babu', 'Executive Suite', 2, 0, 'New', 'Conference hall needed for a half day.', ''],
  ['Meera Joshi', 'Standard Room', 1, 1, 'Contacted', '', 'Left voicemail, will try again tomorrow.'],
];

const day = 86400000;
const TYPES = ['stay', 'stay', 'stay', 'stay', 'stay', 'stay', 'stay', 'stay', 'stay', 'event', 'stay', 'stay', 'stay', 'meeting', 'stay'];
const PICK = ['none', 'none', 'station', 'none', 'none', 'bus', 'none', 'none', 'station', 'none', 'none', 'none', 'none', 'none', 'airport'];

export async function addDemoEnquiries() {
  const { db, F } = await loadFirebase();
  const { collection, doc, setDoc, Timestamp } = F;
  const atNoon = (ms) => {
    const d = new Date(ms);
    d.setHours(12, 0, 0, 0);
    return Timestamp.fromDate(d);
  };
  const now = Date.now();
  const writes = PEOPLE.map(([name, room, adults, children, status, message, note], i) => {
    const created = now - (i * 1.3 + 0.2) * day - (i % 5) * 3600e3;
    const inMs = now + (6 + ((i * 7) % 50)) * day;
    const nights = 1 + (i % 4);
    const first = name.split(' ')[0].toLowerCase();
    return setDoc(doc(collection(db, 'booking_enquiries')), {
      guest_name: name,
      phone: `+91 90000 ${String(10001 + i).padStart(5, '0')}`,
      email: i % 3 === 2 ? null : `${first}@example.com`,
      check_in: atNoon(inMs),
      check_out: atNoon(inMs + nights * day),
      adults,
      children,
      room_type: TYPES[i] === 'stay' ? room : null,
      enquiry_type: TYPES[i],
      event_guests: TYPES[i] === 'stay' ? null : 40 + i * 5,
      pickup: PICK[i],
      addons: i % 4 === 0 ? ['breakfast'] : [],
      message: message || null,
      follow_up_at: ['New', 'Contacted', 'Awaiting Guest'].includes(status) ? Timestamp.fromMillis(now + ((i % 5) - 2) * day) : null,
      source: 'demo',
      status,
      userId: null,
      staff_notes: note ? `[DEMO] ${note}` : '[DEMO]',
      created_at: Timestamp.fromMillis(created),
      updated_at: Timestamp.fromMillis(created + 3600e3),
    });
  });
  await Promise.all(writes);
  return writes.length;
}

export async function removeDemoEnquiries() {
  const { db, F } = await loadFirebase();
  const { collection, deleteDoc, getDocs, query, where } = F;
  const snap = await getDocs(query(collection(db, 'booking_enquiries'), where('source', '==', 'demo')));
  await Promise.all(
    snap.docs.map(async (d) => {
      const [m, h] = await Promise.all([getDocs(collection(d.ref, 'messages')), getDocs(collection(d.ref, 'history'))]);
      await Promise.all([...m.docs, ...h.docs].map((x) => deleteDoc(x.ref)));
      await deleteDoc(d.ref);
    })
  );
  return snap.size;
}
