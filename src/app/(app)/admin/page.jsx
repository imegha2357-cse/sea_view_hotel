import { privateMeta } from '@/lib/meta';
import AdminGate from './gate';

export const metadata = privateMeta('Front desk');

export default function Page() {
  return <AdminGate />;
}
