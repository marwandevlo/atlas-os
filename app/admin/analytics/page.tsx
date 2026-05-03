import AdminShell from '@/app/admin/_components/AdminShell';
import AnalyticsDashboardClient from '@/app/admin/analytics/AnalyticsDashboardClient';

export default function AdminAnalyticsPage() {
  return (
    <AdminShell title="Analytics">
      <AnalyticsDashboardClient />
    </AdminShell>
  );
}
