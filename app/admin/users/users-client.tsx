'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/app/admin/_components/AdminShell';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import { AdminAlert, AdminEmptyState, AdminTableSkeleton } from '@/app/admin/_components/AdminUi';

type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  planId?: string;
  subscriptionStatus?: string;
};

export default function UsersAdminClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [warning, setWarning] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      setWarning('');
      try {
        if (!isAtlasSupabaseDataEnabled()) {
          if (!cancelled) {
            setRows([]);
            setWarning('Local mode: users list is not available.');
          }
          return;
        }

        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? '';
        if (!token) return;

        const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        const json = (await res.json().catch(() => ({}))) as any;
        if (!res.ok) {
          setError(typeof json?.error === 'string' ? json.error : 'forbidden');
          return;
        }

        if (!cancelled) {
          setRows(Array.isArray(json?.users) ? (json.users as AdminUserRow[]) : []);
          if (typeof json?.warning === 'string') setWarning(json.warning);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminShell title="Admin · Users">
      <div className="space-y-4">
        {loading ? <AdminAlert variant="info">Chargement…</AdminAlert> : null}
        {error ? <AdminAlert variant="error">Unable to load users. {error}</AdminAlert> : null}
        {warning ? <AdminAlert variant="warning">{warning}</AdminAlert> : null}
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Users · المستخدمون</p>
          <p className="text-xs text-gray-500 mt-0.5">Email, role, and subscription snapshot.</p>
        </div>
        {loading ? (
          <div className="px-6 py-6">
            <AdminTableSkeleton cols={5} rows={7} />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-8">
            <AdminEmptyState title="No users found" description="When users sign up, they’ll appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Subscription</th>
                  <th className="px-6 py-4 font-semibold">User ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">{u.email || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{u.role || 'user'}</td>
                    <td className="px-6 py-4 text-gray-700">{u.planId || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{u.subscriptionStatus || '—'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

