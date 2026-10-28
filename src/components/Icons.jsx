import { motion } from 'framer-motion';
import { EASE } from './Motion';

const PATHS = {
  parking: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5'],
  wifi: ['M2.5 9a14 14 0 0 1 19 0', 'M5.5 12.5a9.5 9.5 0 0 1 13 0', 'M8.7 16a5 5 0 0 1 6.6 0', 'M12 19.5h.01'],
  breakfast: ['M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z', 'M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17', 'M8 3v3', 'M12 3v3'],
  bell: ['M5 17a7 7 0 0 1 14 0', 'M3 17h18', 'M12 10V7.5', 'M10 7.5h4', 'M4 20h16'],
  laundry: ['M5 3h14v18H5z', 'M5 7h14', 'M12 17.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M8 5h.01'],
  ac: ['M3 5h18v7H3z', 'M6 9h12', 'M7 15v3', 'M12 15v5', 'M17 15v3'],
  map: ['M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z', 'M9 4v14', 'M15 6v14'],
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
