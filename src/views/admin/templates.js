import { GOOGLE_REVIEW_URL, HOTEL, mapsLink } from '../../data/content';
import { formatDate } from '../../lib/enquiry';

// Feature #48: ready-made WhatsApp replies. Staff fill in the [brackets] before sending.
export function templates(r) {
  const first = String(r.guest_name || '').split(' ')[0] || 'there';
  const dates = r.check_in && r.check_out ? `${formatDate(r.check_in)} to ${formatDate(r.check_out)}` : 'your dates';
  const room = r.room_type || 'a room';
  const list = [
    {
      id: 'thanks',
      label: 'Thank you, checking now',
      text: `Hello ${first}, thank you for your enquiry with ${HOTEL.name}, Kanyakumari for ${dates}. We are checking availability and will reply shortly.`,
    },
    {
      id: 'quote',
      label: 'Rate quote',
      text: `Hello ${first}, ${room} is available for ${dates}. The rate is ₹[amount] per night [including / excluding] taxes. To confirm, please reply on this chat and we will share payment details.`,
    },
    {
      id: 'full',
      label: 'Sold out, suggest dates',
      text: `Hello ${first}, we are sorry, we are fully booked for ${dates}. We do have rooms on [other dates]. Would you like us to hold one for you?`,
    },
    {
      id: 'confirm',
      label: 'Booking confirmed',
      text: `Hello ${first}, your stay at ${HOTEL.name} is confirmed for ${dates} (${room}). Please carry a photo ID for each adult. Directions: ${mapsLink}. Call ${HOTEL.phone} for anything you need.`,
    },
    {
      id: 'prearrival',
      label: 'Day before arrival',
      text: `Hello ${first}, we look forward to welcoming you tomorrow at ${HOTEL.name}, East Car Street, Kanyakumari. Let us know your arrival time, or complete online check-in from your account on our website.`,
    },
  ];
  if (GOOGLE_REVIEW_URL)
    list.push({ id: 'review', label: 'Ask for a review', text: `Hello ${first}, thank you for staying with us. If you enjoyed your stay, a short Google review would help us a lot: ${GOOGLE_REVIEW_URL}` });
  return list;
}

export function waNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}
