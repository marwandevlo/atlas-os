'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-red-100 p-8">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-gray-900">غير مصرح لك بالدخول لهذه الصفحة</p>
            <p className="text-sm text-gray-500 mt-1">Access denied.</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-6 px-4 py-3 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#1a3060] inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> العودة إلى لوحة التحكم
        </button>
      </div>
    </div>
  );
}

