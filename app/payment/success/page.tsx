import { Suspense } from 'react';
import SuccessClient from '@/app/payment/success/SuccessClient';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SuccessClient />
    </Suspense>
  );
}

