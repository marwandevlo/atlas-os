import { Suspense } from 'react';
import AdminDashboardClient from '@/app/admin/AdminDashboardClient';

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <AdminDashboardClient />
    </Suspense>
  );
}

