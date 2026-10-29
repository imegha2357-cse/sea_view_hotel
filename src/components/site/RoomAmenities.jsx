import { FacilityIcon } from '../Icons';
import { amenity } from '@/data/catalog';

// The in-room amenities the admin has ticked for this room type, as icons, plus the bed type.
export default function RoomAmenities({ room }) {
  const list = (room.amenities || []).map(amenity).filter(Boolean);
  if (room.beds) list.push({ id: 'beds', icon: 'bed', label: room.beds });
  if (!list.length) return null;
  return (
    <ul className="room-amen" aria-label="In the room">
      {list.map((a, i) => (
        <li key={a.id}>
          <FacilityIcon name={a.icon} i={i % 4} />
          <span>{a.label}</span>
        </li>
      ))}
    </ul>
  );
}
