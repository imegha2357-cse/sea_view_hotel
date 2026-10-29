import { privateMeta } from '@/lib/meta';
import AdminGate from './gate';

export const metadata = privateMeta('Admin');

export default function Page() {
  return <AdminGate />;
}
