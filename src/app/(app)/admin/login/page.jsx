import { privateMeta } from '@/lib/meta';
import AdminLogin from '@/views/admin/AdminLogin';

export const metadata = privateMeta('Staff sign in');

export default function Page() {
  return (
<AdminLogin />
  );
}
