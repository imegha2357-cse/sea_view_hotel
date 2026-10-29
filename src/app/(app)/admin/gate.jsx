'use client';

import dynamic from 'next/dynamic';
import { RequireAdmin } from '@/components/Guards';

const AdminDashboard = dynamic(() => import('@/views/admin/AdminDashboard'), { ssr: false });

export default function AdminGate() {
  return (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  );
}
