import { privateMeta } from '@/lib/meta';
import Unsubscribe from '@/components/site/Unsubscribe';

export const metadata = privateMeta('Unsubscribe');

export default function Page() {
  return (
    <section className="sec" style={{ paddingTop: 120 }}>
      <div className="container narrow">
        <Unsubscribe />
      </div>
    </section>
  );
}
