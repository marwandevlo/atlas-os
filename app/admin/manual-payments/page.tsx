import AdminShell from '@/app/admin/_components/AdminShell';
import ManualPaymentsAdminClient from '@/app/admin/manual-payments/ManualPaymentsAdminClient';

export default function AdminManualPaymentsPage() {
  return (
    <AdminShell title="Paiements manuels">
      <ManualPaymentsAdminClient />
    </AdminShell>
  );
}
