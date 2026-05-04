import { Suspense } from 'react';
import AdminLogsClient from '@/app/admin/logs/logs-client';

export default function AdminLogsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <AdminLogsClient />
    </Suspense>
  );
}

