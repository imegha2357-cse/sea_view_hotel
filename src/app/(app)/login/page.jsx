import { Suspense } from 'react';
import { privateMeta } from '@/lib/meta';
import Login from '@/views/Login';

export const metadata = privateMeta('Guest sign in');

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
