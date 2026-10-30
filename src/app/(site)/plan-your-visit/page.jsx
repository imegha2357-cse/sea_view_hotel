import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import PlanVisitView from '@/components/site/PlanVisitView';
import PhotoStrip from '@/components/site/PhotoStrip';

export const metadata = meta('/plan-your-visit');

export default function PlanVisit() {
  return (
    <>
      <PageTop slot="plan" title="Plan your visit" text="Sunrise times, the weather and the easiest ways to reach the hotel." trail={[{ label: 'Plan your visit', href: '/plan-your-visit' }]} />
      <PlanVisitView />
      <PhotoStrip
        id="sights"
        tone="cream"
        kicker="Worth the trip"
        title="The landmarks near the hotel"
        items={[
          { image: 'vivekananda', caption: 'Vivekananda Rock Memorial' },
          { image: 'thiruvalluvar', caption: 'Thiruvalluvar Statue' },
          { image: 'beach', caption: 'Kanyakumari beach' },
          { image: 'gandhi', caption: 'Gandhi Memorial Mandapam' },
          { image: 'sunset', caption: 'Sunset Point' },
        ]}
      />
    </>
  );
}
