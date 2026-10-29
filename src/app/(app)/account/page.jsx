import { privateMeta } from '@/lib/meta';
import AccountGate from './gate';

export const metadata = privateMeta('My account');

export default function Page() {
  return <AccountGate />;
}
