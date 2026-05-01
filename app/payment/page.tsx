import { Suspense } from 'react';
import PaymentClient from '@/app/payment/PaymentClient';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PaymentClient />
    </Suspense>
  );
}

