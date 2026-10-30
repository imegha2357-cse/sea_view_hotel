// Requests that go straight to WhatsApp with a ready-to-fill message (no form).
import { HOTEL } from './content.js';

const NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || HOTEL.whatsapp).replace(/\D/g, '');
const wa = (text) => `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;

export const WA_REQUESTS = {
  group: {
    title: 'Group and pilgrim bookings',
    text: 'Tour, pilgrim and school groups: send your dates and numbers on WhatsApp.',
    message: `Hello ${HOTEL.name}, I would like to book for a group or pilgrimage.\nDates: \nNumber of people: \nRooms needed: \nMeals: `,
  },
  corporate: {
    title: 'Corporate stays',
    text: 'Staff travel, meetings and team trips: ask for a corporate quote on WhatsApp.',
    message: `Hello ${HOTEL.name}, I would like a quote for a corporate stay.\nCompany: \nDates: \nNumber of guests: \nConference hall needed: `,
  },
  gift: {
    title: 'Gift a stay',
    text: 'Give someone a sunrise in Kanyakumari: arrange a gift voucher on WhatsApp.',
    message: `Hello ${HOTEL.name}, I would like to gift a stay.\nWho it is for: \nOccasion: \nNights: \nRoom: `,
  },
  callback: {
    title: 'Request a call back',
    text: 'Leave your number and a good time on WhatsApp and we will call you.',
    message: `Hello ${HOTEL.name}, please call me back.\nMy name: \nBest time to call: \nAbout: `,
  },
};

export const waRequest = (type) => wa(WA_REQUESTS[type].message);
export const isExternal = (href) => /^https?:\/\//.test(href || '');
