// Thin line icons for the hero strip and buttons.
const P = {
  waves: 'M3 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 14c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0',
  sunrise: 'M4 18h16M7 18a5 5 0 0 1 10 0M12 4v4M5.6 8.6l1.8 1.8M18.4 8.6l-1.8 1.8M3 21h18',
  dish: 'M3 16h18M5 16a7 7 0 0 1 14 0M12 9V7M10 7h4M2 19h20',
  bell: 'M5 17h14l-1.5-2V11a5.5 5.5 0 0 0-11 0v4L5 17zM10 20a2 2 0 0 0 4 0',
  parking: 'M5 3h14v18H5zM10 17V8h3a2.5 2.5 0 0 1 0 5h-3',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  chat: 'M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
};

export function HeroIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}
