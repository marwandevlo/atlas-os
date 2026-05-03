import AdminShell from '@/app/admin/_components/AdminShell';
import FunnelDashboardClient from '@/app/admin/funnel/FunnelDashboardClient';

export default function AdminFunnelPage() {
  return (
    <AdminShell title="Admin · Funnel">
      <FunnelDashboardClient />
    </AdminShell>
  );
}
