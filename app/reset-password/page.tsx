import { Suspense } from 'react';
import ResetPasswordClient from '@/app/reset-password/ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center text-white/80 text-sm">
          Chargement…
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
