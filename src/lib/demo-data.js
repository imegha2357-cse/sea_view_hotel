// Demo data for trying the admin panel (Hotel → Setup checklist → Demo data). Everything is
// staff-only or hidden from guests: requests, the housekeeping board, hidden menu dishes and draft
// posts. Every item is marked as demo and "Remove demo data" deletes exactly these items.
import { fb } from './firebase';
import { loadList, publishChanges, saveList } from './cms-admin';

const day = (n) => {
  const d = new Date(Date.now() + 5.5 * 3600e3 + n * 864e5);
  return d.toISOString().slice(0, 10);
};

// 15 requests across every form type, with a mix of statuses.
const REQUESTS = [
  ['group', 'Demo – Ramesh Iyer', '+91 98400 11201', { 'Arrival date': day(12), 'Departure date': day(14), 'Number of people': '42', 'Type of group': 'Pilgrim group', Meals: 'All meals (vegetarian)', 'Coming by': 'Bus / coach (needs parking)' }, 'Pilgrim group from Madurai, need rooms on the same floor.', 'New'],
  ['corporate', 'Demo – Priya Nair', '+91 94470 22302', { Company: 'Demo Textiles Pvt Ltd', 'Arrival date': day(20), 'Number of guests': '12', 'Need the conference hall?': 'Yes, full day', 'How often': 'Several times a year' }, 'Annual sales meet; please send a corporate quote.', 'In progress'],
  ['gift', 'Demo – Arun Kumar', '+91 99620 33403', { 'Who is it for?': 'Parents', Occasion: 'Anniversary', Nights: '2', Room: 'Deluxe Seaview Room', 'Message on the voucher': 'Happy 35th anniversary' }, '', 'New'],
  ['tour', 'Demo – Meena Shah', '+91 98200 44504', { 'What do you need?': 'Trivandrum airport transfer', Date: day(5), Time: '14:30', People: '3', Vehicle: 'Sedan (4)' }, 'Flight lands at 1:45 pm.', 'Done'],
  ['table', 'Demo – Karthik Raja', '+91 90030 55605', { Date: day(1), Time: '20:00', People: '6', Meal: 'Dinner', 'Staying at the hotel?': 'No' }, 'Birthday dinner, a window table if possible.', 'New'],
  ['celebration', 'Demo – Anjali Menon', '+91 97450 66706', { Occasion: 'Proposal', Date: day(9), 'What would you like?': 'Cake and decoration', 'Already booked a room?': 'Yes' }, 'Please keep it a surprise.', 'In progress'],
  ['agent', 'Demo – Suresh Travels', '+91 98840 77807', { 'Agency name': 'Demo Suresh Tours and Travels', City: 'Chennai', 'Room nights per year (estimate)': '200–500' }, 'Looking for agent rates for the winter season.', 'New'],
  ['callback', 'Demo – Fatima Begum', '+91 95000 88908', { 'Best time to call': 'Evening (4 – 8 pm)', About: 'Room booking', Language: 'Tamil' }, '', 'New'],
  ['stay', 'Demo – Guest', '+91 98765 99009', { 'What do you need?': 'Extra towels' }, '', 'Done', '204'],
  ['stay', 'Demo – Guest', '+91 98765 10110', { 'What do you need?': 'Late check-out' }, 'Our train is at 4 pm.', 'New', '312'],
  ['stay', 'Demo – Guest', '+91 98765 21211', { 'What do you need?': 'Something is not working' }, 'The TV remote does not work.', 'In progress', '108'],
  ['group', 'Demo – St. Mary’s School', '+91 94430 32312', { 'Arrival date': day(30), 'Departure date': day(31), 'Number of people': '55', 'Type of group': 'School or college', Meals: 'Breakfast only' }, 'Students and 5 teachers.', 'New'],
  ['tour', 'Demo – Vikram Singh', '+91 98110 43413', { 'What do you need?': 'Kanyakumari local sightseeing', Date: day(2), People: '4', Vehicle: 'SUV (6–7)' }, '', 'New'],
  ['corporate', 'Demo – Lakshmi Rao', '+91 99860 54514', { Company: 'Demo Software Solutions', 'Arrival date': day(45), 'Number of guests': '25', 'Need the conference hall?': 'Yes, several days', 'How often': 'One-time' }, 'Team offsite, 3 days.', 'Cancelled'],
  ['callback', 'Demo – Joseph Thomas', '+91 94950 65615', { 'Best time to call': 'Morning (9 am – 12 pm)', About: 'Event or wedding', Language: 'Malayalam' }, 'Wedding reception for about 150 guests.', 'New'],
];

const HK = ['clean', 'dirty', 'occupied', 'inspect', 'clean', 'occupied', 'occupied', 'dirty', 'clean', 'blocked', 'occupied', 'clean', 'inspect', 'occupied', 'clean'];
const HK_ROOMS = ['101', '102', '103', '104', '105', '201', '202', '203', '204', '205', '301', '302', '303', '304', '305'];

const MENU = [
  ['Idli with sambar and chutney', 'Breakfast', 'Veg'],
  ['Masala dosa', 'Breakfast', 'Veg'],
  ['Pongal with vada', 'Breakfast', 'Veg'],
  ['Gobi 65', 'Starters', 'Veg'],
  ['Chicken 65', 'Starters', 'Non-veg'],
  ['Fish fry', 'Starters', 'Non-veg'],
  ['South Indian meals', 'Mains', 'Veg'],
  ['Kerala fish curry', 'Mains', 'Non-veg'],
  ['Chettinad chicken', 'Mains', 'Non-veg'],
  ['Paneer butter masala', 'Mains', 'Veg'],
  ['Veg fried rice', 'Breads and rice', 'Veg'],
  ['Parotta', 'Breads and rice', 'Veg'],
  ['Egg biryani', 'Breads and rice', 'Egg'],
  ['Gulab jamun', 'Desserts', 'Veg'],
  ['Fresh lime soda', 'Drinks', 'Vegan'],
];

const POSTS = [
  ['demo-sunrise-tips', 'Demo post: five tips for the Kanyakumari sunrise', 'A sample draft to show how News posts look.'],
  ['demo-festival-season', 'Demo post: the festival season in Kanyakumari', 'A sample draft to show how News posts look.'],
  ['demo-new-restaurant-menu', 'Demo post: our new restaurant menu', 'A sample draft to show how News posts look.'],
];

const isDemo = (x) => String(x?.note || '').startsWith('Demo');

export async function loadDemo(me) {
  const { db, F } = fb();
  const done = [];
  // Requests: created as "New" (as the website does), then some moved on.
  for (const [i, [type, name, phone, fields, message, status, room]] of REQUESTS.entries()) {
    const ref = F.doc(db, 'requests', `demo-${String(i + 1).padStart(2, '0')}`);
    if ((await F.getDoc(ref)).exists()) continue;
    await F.setDoc(ref, { type, name, phone, email: null, fields, message, room_number: room || '', status: 'New', userId: null, created_at: F.serverTimestamp(), updated_at: F.serverTimestamp(), lang: 'en' });
    if (status !== 'New') await F.updateDoc(ref, { status, staff_note: 'Demo: sample staff note', updated_at: F.serverTimestamp() });
  }
  done.push('15 requests');
  // Housekeeping board: 15 rooms, merged with any rooms already on it.
  const hkRef = F.doc(db, 'housekeeping', 'board');
  const hk = (await F.getDoc(hkRef)).data()?.rooms || {};
  HK_ROOMS.forEach((n, i) => {
    hk[n] ||= { s: HK[i], by: 'demo', at: Date.now() - i * 600000 };
  });
  await F.setDoc(hkRef, { rooms: hk, updated_at: F.serverTimestamp(), updated_by: String(me || '').slice(0, 120) });
  done.push('15 housekeeping rooms');
  // Restaurant menu: 15 dishes, all hidden from the website, no prices.
  const menu = await loadList('menu');
  if (!menu.some(isDemo)) {
    await saveList('menu', [...menu, ...MENU.map(([name, section, diet]) => ({ name, section, diet, price: '', note: 'Demo dish: replace with the real menu', hidden: true }))], me);
  }
  done.push('15 hidden menu dishes');
  // News: draft posts (never published).
  for (const [slug, title, summary] of POSTS) {
    await F.setDoc(F.doc(db, 'posts', slug), { title, summary, body: `${summary}\n\n## How to use it\n\nEdit this draft in News and blog, or delete it. Drafts never appear on the website until you tick "Publish".`, image: 'sunset', date: day(0), published: false, updated_at: F.serverTimestamp(), updated_by: String(me || '').slice(0, 120) });
  }
  done.push('3 draft posts');
  await publishChanges();
  return done;
}

export async function clearDemo(me) {
  const { db, F } = fb();
  for (let i = 1; i <= REQUESTS.length; i++) await F.deleteDoc(F.doc(db, 'requests', `demo-${String(i).padStart(2, '0')}`)).catch(() => {});
  const hkRef = F.doc(db, 'housekeeping', 'board');
  const hk = (await F.getDoc(hkRef)).data()?.rooms || {};
  for (const n of Object.keys(hk)) if (hk[n]?.by === 'demo') delete hk[n];
  await F.setDoc(hkRef, { rooms: hk, updated_at: F.serverTimestamp(), updated_by: String(me || '').slice(0, 120) });
  const menu = await loadList('menu');
  if (menu.some(isDemo)) await saveList('menu', menu.filter((x) => !isDemo(x)), me);
  for (const [slug] of POSTS) await F.deleteDoc(F.doc(db, 'posts', slug)).catch(() => {});
  await publishChanges();
}
