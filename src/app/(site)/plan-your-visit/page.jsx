import { meta } from '@/lib/meta';
import PageTop from '@/components/site/PageTop';
import PlanVisitView from '@/components/site/PlanVisitView';

export const metadata = meta('/plan-your-visit');

export default function PlanVisit() {
  return (
    <>
      <PageTop slot="plan" title="Plan your visit" text="Sunrise times, the weather and the easiest ways to reach the hotel." trail={[{ label: 'Plan your visit', href: '/plan-your-visit' }]} />
      <PlanVisitView />
    </>
  );
}
