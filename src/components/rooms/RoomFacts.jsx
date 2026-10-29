import { FacilityIcon } from '../Icons';

// Icon row under a room's name (Taj: size, guests, bed type).
export function roomFacts(r) {
  const f = [];
  if (r.size) f.push({ k: 'size', icon: 'size', label: r.size });
  if (r.guests) f.push({ k: 'guests', icon: 'people', label: `Up to ${r.guests} guest${r.guests === 1 ? '' : 's'}` });
  else if (r.occupancy) f.push({ k: 'guests', icon: 'people', label: `Sleeps ${r.occupancy}` });
  if (r.beds) f.push({ k: 'beds', icon: 'bed', label: r.beds });
  return f;
}

export default function RoomFacts({ room, className = '' }) {
  const f = roomFacts(room);
  if (!f.length) return null;
  return (
    <ul className={`rfacts ${className}`} aria-label="Room facts">
      {f.map((x) => (
        <li key={x.k}>
          <FacilityIcon name={x.icon} />
          <span>{x.label}</span>
        </li>
      ))}
    </ul>
  );
}
