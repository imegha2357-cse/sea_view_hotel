'use client';

import dynamic from 'next/dynamic';
import { RequireGuest } from '@/components/Guards';

// The account screen and Firebase load only for signed-in guests.
const Account = dynamic(() => import('@/views/account/Account'), { ssr: false });

export default function AccountGate() {
  return (
    <RequireGuest>
      <Account />
    </RequireGuest>
  );
}
