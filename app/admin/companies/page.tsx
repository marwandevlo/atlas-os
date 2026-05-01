import { Suspense } from 'react';
import CompaniesAdminClient from '@/app/admin/companies/companies-client';

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CompaniesAdminClient />
    </Suspense>
  );
}

