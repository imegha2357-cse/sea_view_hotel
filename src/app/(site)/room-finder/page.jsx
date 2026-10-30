import { meta } from '@/lib/meta';
import { getRooms } from '@/lib/cms-server';
import PageTop from '@/components/site/PageTop';
import RoomFinder from '@/components/rooms/RoomFinder';

export const metadata = meta('/room-finder');
export const revalidate = 600;

export default async function Finder() {
  const rooms = await getRooms();
  return (
    <>
      <PageTop slot="rooms" title="Find your room" text="Three quick questions, and we suggest the room that suits your trip." trail={[{ label: 'Rooms', href: '/rooms' }, { label: 'Find your room', href: '/room-finder' }]} />
      <RoomFinder rooms={rooms} />
    </>
  );
}
