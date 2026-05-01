import { Suspense } from 'react';
import PlansAdminClient from '@/app/admin/plans/plans-client';

export default function AdminPlansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PlansAdminClient />
    </Suspense>
  );
}

