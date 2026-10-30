import { HOTEL } from '@/data/content';
import { privateMeta } from '@/lib/meta';
import { getSettings } from '@/lib/cms-server';
import StayGuide from '@/components/site/StayGuide';

export const metadata = privateMeta('Your room guide');
export const revalidate = 300;

// Digital room guide (the QR code in every room). Not in search results.
export default async function Stay() {
  const s = await getSettings();
  return <StayGuide info={s.stay_info || {}} checkIn={s.check_in || HOTEL.checkIn || ''} checkOut={s.check_out || HOTEL.checkOut || ''} phone={HOTEL.phone} phoneHref={HOTEL.phoneHref} restaurantPhone={HOTEL.restaurantPhone} restaurantHref={HOTEL.restaurantPhoneHref} />;
}
