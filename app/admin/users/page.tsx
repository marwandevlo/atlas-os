import { Suspense } from 'react';
import UsersAdminClient from '@/app/admin/users/users-client';

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <UsersAdminClient />
    </Suspense>
  );
}

