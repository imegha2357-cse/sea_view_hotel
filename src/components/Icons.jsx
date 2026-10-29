'use client';

import { motion } from 'framer-motion';
import { EASE } from './Motion';

const PATHS = {
  size: ['M4 4h16v16H4z', 'M8 8l8 8', 'M8 8h3.5', 'M8 8v3.5', 'M16 16h-3.5', 'M16 16v-3.5'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
  parking: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5'],
  wifi: ['M2.5 9a14 14 0 0 1 19 0', 'M5.5 12.5a9.5 9.5 0 0 1 13 0', 'M8.7 16a5 5 0 0 1 6.6 0', 'M12 19.5h.01'],
  breakfast: ['M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z', 'M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17', 'M8 3v3', 'M12 3v3'],
  bell: ['M5 17a7 7 0 0 1 14 0', 'M3 17h18', 'M12 10V7.5', 'M10 7.5h4', 'M4 20h16'],
  laundry: ['M5 3h14v18H5z', 'M5 7h14', 'M12 17.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M8 5h.01'],
  ac: ['M3 5h18v7H3z', 'M6 9h12', 'M7 15v3', 'M12 15v5', 'M17 15v3'],
  map: ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z', 'M9 4v14', 'M15 6v14'],
  rings: ['M9 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M15 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M10 5l2-2 2 2-2 2z'],
  umbrella: ['M3 12a9 9 0 0 1 18 0z', 'M12 12v7a2 2 0 0 1-4 0', 'M12 3v1', 'M2 22h20'],
  dish: ['M3 17h18', 'M5 17a7 7 0 0 1 14 0', 'M12 7V5', 'M10 5h4', 'M2 20h20'],
  glass: ['M6 3h12l-6 9z', 'M12 12v8', 'M8 21h8', 'M8.5 7h7'],
  heart: ['M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'],
  cake: ['M4 21h16', 'M5 21v-7h14v7', 'M5 16c2 1.5 4 1.5 7 0s5-1.5 7 0', 'M12 14v-3', 'M12 8.5c-.8-.8-.8-1.8 0-3 .8 1.2.8 2.2 0 3z'],
  people: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5', 'M16 4.5a3 3 0 0 1 0 6', 'M18 14.8c1.7.7 2.7 2.4 3 5.2'],
  table: ['M3 9h18', 'M5 9l-1 11', 'M19 9l1 11', 'M8 5h8', 'M12 5v4'],
  board: ['M3 4h18v12H3z', 'M12 16v4', 'M8 20h8', 'M7 9h6', 'M7 12h10'],
  bus: ['M5 4h14a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1z', 'M4 11h16', 'M7 20v-3', 'M17 20v-3', 'M8 14.5h.01', 'M16 14.5h.01'],
  bed: ['M3 18V7', 'M3 13h18v5', 'M21 18v-3a3 3 0 0 0-3-3H10v1', 'M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  tv: ['M3 5h18v12H3z', 'M8 21h8', 'M12 17v4'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
  bath: ['M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z', 'M6 12V6a2 2 0 0 1 4 0', 'M7 20l-1 2', 'M17 20l1 2'],
  waves: ['M3 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0', 'M3 14c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0', 'M3 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0'],
  desk: ['M3 10h18', 'M5 10v10', 'M19 10v10', 'M14 10v5h5', 'M8 6h3v4H8z'],
  balcony: ['M3 12h18', 'M5 12v8', 'M9 12v8', 'M13 12v8', 'M17 12v8', 'M3 20h18', 'M6 12V5h12v7'],
  door: ['M6 3h12v18H6z', 'M14 12h.01', 'M3 21h18'],
  leaf: ['M5 19c0-8 6-14 15-14 0 9-6 15-14 15', 'M5 19l7-7'],
  pin: ['M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  car: ['M5 16l1.5-6h11L19 16', 'M3 16h18v3H3z', 'M7 19v2', 'M17 19v2', 'M7.5 13.5h.01', 'M16.5 13.5h.01'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 20h20', 'M12 2v2', 'M4.9 4.9l1.4 1.4', 'M19.1 4.9l-1.4 1.4', 'M2 12h2', 'M20 12h2'],
};

// #69: facility icons draw their strokes in when they enter view
export function FacilityIcon({ name, i = 0 }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {(PATHS[name] || PATHS.sun).map((d, k) => (
        <motion.path
          key={k}
          d={d}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 + k * 0.08 }}
        />
      ))}
    </svg>
  );
}

export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

export const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5zm0 1.8a7.7 7.7 0 1 1-3.9 14.3l-.3-.2-2.8.8.8-2.7-.2-.3A7.7 7.7 0 0 1 12 4.3zm-3.1 3.9c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.1.8 2.6.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.3 6.3 0 0 1-3.1-2.7c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5z" />
  </svg>
);

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const CheckCircle = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <motion.circle cx="24" cy="24" r="21" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: EASE }} />
    <motion.path d="M15 24.5l6 6 12-13" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: EASE, delay: 0.45 }} />
  </svg>
);

export const DirectionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l18-8-8 18-2-8z" />
  </svg>
);
