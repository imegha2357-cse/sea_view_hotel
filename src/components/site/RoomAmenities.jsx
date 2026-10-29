import { FacilityIcon } from '../Icons';

// Feature #25: the in-room basics the hotel publishes, plus what this room adds, as icons.
const BASE = [
  { icon: 'bath', label: 'Private bathroom' },
  { icon: 'tv', label: 'Television' },
  { icon: 'phone', label: 'Direct-dial phone' },
  { icon: 'bell', label: '24-hour room service' },
];

export default function RoomAmenities({ room }) {
  const extra = [];
  if (room.tags.includes('sea')) extra.push({ icon: 'sun', label: 'Sunrise view' }, { icon: 'waves', label: 'Sea view' });
  if (room.tags.includes('city')) extra.push({ icon: 'pin', label: 'City view' });
  if (room.features.some((f) => /work area/i.test(f))) extra.push({ icon: 'desk', label: 'Work area' });
  if (room.features.some((f) => /balcon/i.test(f))) extra.push({ icon: 'balcony', label: 'Two balconies' });
  if (room.features.some((f) => /interconnect/i.test(f))) extra.push({ icon: 'door', label: 'Interconnecting door' });
  extra.push({ icon: 'bed', label: room.beds });
  return (
    <ul className="room-amen" aria-label="In the room">
      {[...extra, ...BASE].map((a, i) => (
        <li key={a.label}>
          <FacilityIcon name={a.icon} i={i % 4} />
          <span>{a.label}</span>
        </li>
      ))}
    </ul>
  );
}
