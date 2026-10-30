import { meta } from '@/lib/meta';
import { getRooms } from '@/lib/cms-server';
import PageTop from '@/components/site/PageTop';
import CompareRooms from '@/components/rooms/CompareRooms';

export const metadata = meta('/rooms/compare');
export const revalidate = 600;

export default async function Compare() {
  const rooms = await getRooms();
  return (
    <>
      <PageTop slot="rooms" title="Compare rooms" text="Pick up to three rooms to see them side by side." trail={[{ label: 'Rooms', href: '/rooms' }, { label: 'Compare', href: '/rooms/compare' }]} />
      <CompareRooms rooms={rooms} />
    </>
  );
}
