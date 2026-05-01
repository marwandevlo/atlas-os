import { Suspense } from 'react';
import PaymentsAdminClient from '@/app/admin/payments/payments-client';

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PaymentsAdminClient />
    </Suspense>
  );
}

