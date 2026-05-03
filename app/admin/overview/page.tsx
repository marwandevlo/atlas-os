import AdminShell from '@/app/admin/_components/AdminShell';
import RevenueOverviewClient from '@/app/admin/overview/RevenueOverviewClient';

export default function AdminOverviewPage() {
  return (
    <AdminShell title="Overview revenue">
      <RevenueOverviewClient />
    </AdminShell>
  );
}
