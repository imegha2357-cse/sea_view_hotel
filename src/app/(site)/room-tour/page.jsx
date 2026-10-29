import { meta } from '@/lib/meta';
import RoomTourView from '@/components/site/RoomTourView';

export const metadata = meta('/room-tour', { image: '/media/room-tour-poster.jpg' });

export default function RoomTour() {
  return (
    <>
      <RoomTourView />
    </>
  );
}
