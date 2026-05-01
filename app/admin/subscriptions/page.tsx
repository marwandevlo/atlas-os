'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDaysYmd, todayYmd } from '@/app/lib/atlas-dates';
import { ArrowLeft, BadgeCheck, Ban, CheckCircle2, Clock, CreditCard, Filter, ShieldCheck } from 'lucide-react';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';

type PendingPaymentStatus = 'pending' | 'paid' | 'active' | 'rejected';
type PaymentMethod = 'card' | 'cmi' | 'manual';
type ManualProvider = 'cashplus' | 'wafacash' | 'western_union';

type PendingSubscription = {
  id: string; // reference/order id
  status: PendingPaymentStatus;
  planId: string;
  planName: string;
  amount: number;
  currency: 'MAD';
  billingPeriod: 'year' | 'trial';
  paymentMethod: PaymentMethod;
  manualProvider?: ManualProvider;
  createdAt: string;
};

type ActiveSubscription = {
  id: string;
  planId: string;
  planName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'active';
  paymentReference: string;
  createdAt: string;
};

const STORAGE = {
  pending: 'atlas_pending_subscriptions',
  active: 'atlas_active_subscriptions',
} as const;

const LOCAL_ADMIN_ROLE_KEY = 'atlas_user_role';

function isLocalDevAdminEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ATLAS_ENABLE_LOCAL_ADMIN === 'true';
}

function hasLocalAdminRole(): boolean {
  if (typeof window === 'undefined') return false;
  return (localStorage.getItem(LOCAL_ADMIN_ROLE_KEY) ?? '').trim() === 'admin';
}

function readJsonArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function prettyMethod(p: PendingSubscription): string {
  if (p.paymentMethod === 'card') return 'Card (Visa/Mastercard/Maestro)';
  if (p.paymentMethod === 'cmi') return 'CMI Online';
  if (p.paymentMethod === 'manual') {
    const provider = p.manualProvider === 'cashplus' ? 'CashPlus' : p.manualProvider === 'wafacash' ? 'WafaCash' : p.manualProvider === 'western_union' ? 'Western Union' : 'Manual';
    return `Manual · ${provider}`;
  }
  return p.paymentMethod;
}

function statusBadge(status: PendingPaymentStatus): { label: string; cls: string } {
  if (status === 'pending') return { label: 'Pending', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (status === 'paid') return { label: 'Paid', cls: 'bg-blue-50 text-blue-800 border-blue-200' };
  if (status === 'active') return { label: 'Active', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  return { label: 'Rejected', cls: 'bg-red-50 text-red-800 border-red-200' };
}

function toYmdFromIso(iso: string): string {
  // safe fallback for malformed timestamps
  if (!iso) return todayYmd();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return todayYmd();
  return todayYmd(d);
}

function addOneYearYmd(startYmd: string): string {
  // keep deterministic and simple: 365 days
  return addDaysYmd(startYmd, 365);
}

export default function AdminSubscriptionsPage() {
  const router = useRouter();

  const [pendingRequests, setPendingRequests] = useState<PendingSubscription[]>([]);
  const [activeSubs, setActiveSubs] = useState<ActiveSubscription[]>([]);
  const [filter, setFilter] = useState<'pending' | 'active' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        if (isAtlasSupabaseDataEnabled()) {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token ?? '';
          if (!token) {
            router.push('/login?next=/admin/subscriptions');
            return;
          }

          const [reqRes, subRes] = await Promise.all([
            supabase
              .from('atlas_payment_requests')
              .select('id, plan_id, amount_mad, currency, billing_period, payment_method, manual_provider, status, created_at')
              .order('created_at', { ascending: false })
              .limit(200),
            supabase
              .from('atlas_subscriptions')
              .select('id, plan_id, status, start_date, end_date, payment_request_id, created_at')
              .order('created_at', { ascending: false })
              .limit(200),
          ]);

          if (reqRes.error) throw new Error('db_error');
          if (subRes.error) throw new Error('db_error');

          const reqs: PendingSubscription[] = (reqRes.data ?? []).map((r: any) => ({
            id: String(r.id),
            status: String(r.status) as PendingPaymentStatus,
            planId: String(r.plan_id ?? ''),
            planName: String(r.plan_id ?? ''),
            amount: Number(r.amount_mad ?? 0),
            currency: 'MAD',
            billingPeriod: (r.billing_period ?? 'year') as any,
            paymentMethod: (r.payment_method ?? 'manual') as any,
            manualProvider: (r.manual_provider ?? undefined) as any,
            createdAt: String(r.created_at ?? new Date().toISOString()),
          }));

          const subs: ActiveSubscription[] = (subRes.data ?? []).map((s: any) => ({
            id: String(s.id),
            planId: String(s.plan_id ?? ''),
            planName: String(s.plan_id ?? ''),
            startDate: String(s.start_date ?? ''),
            endDate: String(s.end_date ?? ''),
            status: 'active',
            paymentReference: String(s.payment_request_id ?? ''),
            createdAt: String(s.created_at ?? new Date().toISOString()),
          }));

          if (!cancelled) {
            setPendingRequests(reqs);
            setActiveSubs(subs);
          }
          return;
        }

        // Local/demo fallback
        // LOCAL TESTING ONLY: gated by env + localStorage role.
        if (!isLocalDevAdminEnabled() || !hasLocalAdminRole()) {
          router.push('/access-denied');
          return;
        }
        if (!cancelled) {
          setPendingRequests(readJsonArray<PendingSubscription>(STORAGE.pending));
          setActiveSubs(readJsonArray<ActiveSubscription>(STORAGE.active));
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

  const stats = useMemo(() => {
    const pending = pendingRequests.filter((p) => p.status === 'pending').length;
    const paid = pendingRequests.filter((p) => p.status === 'paid').length;
    const activeFromRequests = pendingRequests.filter((p) => p.status === 'active').length;
    const rejected = pendingRequests.filter((p) => p.status === 'rejected').length;
    const active = activeSubs.filter((s) => s.status === 'active').length;
    return { pending, paid, activeFromRequests, active, rejected };
  }, [activeSubs, pendingRequests]);

  const filtered = useMemo(() => {
    if (filter === 'all') return pendingRequests;
    return pendingRequests.filter((p) => p.status === filter);
  }, [filter, pendingRequests]);

  const persistPending = (next: PendingSubscription[]) => {
    setPendingRequests(next);
    writeJsonArray(STORAGE.pending, next);
  };

  const persistActive = (next: ActiveSubscription[]) => {
    setActiveSubs(next);
    writeJsonArray(STORAGE.active, next);
  };

  const markAsPaid = async (id: string) => {
    if (isAtlasSupabaseDataEnabled()) {
      setError('');
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? '';
        if (!token) {
          router.push('/login?next=/admin/subscriptions');
          return;
        }
        const res = await fetch('/api/admin/payments/mark-paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paymentRequestId: id }),
        });
        if (!res.ok) throw new Error('forbidden');
        const updated = pendingRequests.map((p) => (p.id === id ? { ...p, status: 'paid' as const } : p));
        setPendingRequests(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setLoading(false);
      }
      return;
    }

    const next = pendingRequests.map((p) => (p.id === id ? { ...p, status: 'paid' as const } : p));
    persistPending(next);
  };

  const rejectPayment = async (id: string) => {
    const ok = window.confirm('Rejeter ce paiement ? Cette action peut être annulée en réactivant la demande.');
    if (!ok) return;

    if (isAtlasSupabaseDataEnabled()) {
      setError('');
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? '';
        if (!token) {
          router.push('/login?next=/admin/subscriptions');
          return;
        }
        const res = await fetch('/api/admin/payments/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paymentRequestId: id }),
        });
        if (!res.ok) throw new Error('forbidden');
        const updated = pendingRequests.map((p) => (p.id === id ? { ...p, status: 'rejected' as const } : p));
        setPendingRequests(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setLoading(false);
      }
      return;
    }

    const next = pendingRequests.map((p) => (p.id === id ? { ...p, status: 'rejected' as const } : p));
    persistPending(next);
  };

  const activateSubscription = async (id: string) => {
    if (isAtlasSupabaseDataEnabled()) {
      setError('');
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? '';
        if (!token) {
          router.push('/login?next=/admin/subscriptions');
          return;
        }
        const res = await fetch('/api/admin/subscriptions/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ paymentRequestId: id }),
        });
        const json = (await res.json().catch(() => ({}))) as any;
        if (!res.ok) throw new Error(typeof json?.error === 'string' ? json.error : 'Erreur');

        // optimistic: add to active list
        const req = pendingRequests.find((p) => p.id === id);
        if (req) {
          const nextActive: ActiveSubscription = {
            id: `sub_${id}`,
            planId: req.planId,
            planName: req.planName,
            startDate: String(json.startDate ?? todayYmd()),
            endDate: String(json.endDate ?? ''),
            status: 'active',
            paymentReference: id,
            createdAt: new Date().toISOString(),
          };
          setActiveSubs((prev) => [nextActive, ...prev]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setLoading(false);
      }
      return;
    }

    const req = pendingRequests.find((p) => p.id === id);
    if (!req) return;

    const startDate = todayYmd();
    const endDate = req.billingPeriod === 'trial' ? addDaysYmd(startDate, 7) : addOneYearYmd(startDate);

    const active: ActiveSubscription = {
      id: `sub_${id}`,
      planId: req.planId,
      planName: req.planName,
      startDate,
      endDate,
      status: 'active',
      paymentReference: req.id,
      createdAt: new Date().toISOString(),
    };

    // Update request status
    const nextPending = pendingRequests.map((p) => (p.id === id ? { ...p, status: 'active' as const } : p));
    persistPending(nextPending);

    // Write active subscription (avoid duplicates)
    const exists = activeSubs.some((s) => s.paymentReference === req.id);
    const nextActive = exists ? activeSubs : [active, ...activeSubs];
    persistActive(nextActive);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="text-gray-200">/</span>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={18} /> Admin · Subscriptions
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            Chargement…
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Pending payments</p>
              <Clock size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Paid (waiting activation): {stats.paid}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Active subscriptions</p>
              <BadgeCheck size={16} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.active}</p>
            <p className="text-xs text-gray-400 mt-1">Activated from requests: {stats.activeFromRequests}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Rejected payments</p>
              <Ban size={16} className="text-red-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.rejected}</p>
            <p className="text-xs text-gray-400 mt-1">LocalStorage moderation (temp)</p>
          </div>
        </div>

        {/* Filters + Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Payment requests</p>
              <p className="text-xs text-gray-500 mt-0.5">LocalStorage key: <span className="font-mono">{STORAGE.pending}</span></p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 mr-2">
                <Filter size={14} /> Filtre
              </div>
              {([
                { id: 'pending', label: `Pending (${stats.pending})` },
                { id: 'active', label: `Active (${stats.activeFromRequests})` },
                { id: 'rejected', label: `Rejected (${stats.rejected})` },
                { id: 'all', label: `All (${pendingRequests.length})` },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    filter === t.id ? 'bg-[#0F1F3D] text-white border-[#0F1F3D]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                      Aucun enregistrement pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const badge = statusBadge(p.status);
                    return (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">{p.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{p.planName}</div>
                          <div className="text-xs text-gray-500">{p.planId}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {Math.round(p.amount).toLocaleString()} {p.currency}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-gray-400" />
                            <span>{prettyMethod(p)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{toYmdFromIso(p.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {(p.status === 'pending' || p.status === 'paid') && (
                              <button
                                onClick={() => markAsPaid(p.id)}
                                className="px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold hover:bg-blue-100 flex items-center gap-2"
                                title="Mark as paid"
                              >
                                <CheckCircle2 size={14} /> Paid
                              </button>
                            )}
                            {(p.status === 'paid' || p.status === 'pending') && (
                              <button
                                onClick={() => activateSubscription(p.id)}
                                className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-2"
                                title="Activate subscription"
                              >
                                <BadgeCheck size={14} /> Activate
                              </button>
                            )}
                            {p.status !== 'rejected' && (
                              <button
                                onClick={() => rejectPayment(p.id)}
                                className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold hover:bg-red-100 flex items-center gap-2"
                                title="Reject payment"
                              >
                                <Ban size={14} /> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-900">Active subscriptions</p>
          <p className="text-xs text-gray-500 mt-0.5">LocalStorage key: <span className="font-mono">{STORAGE.active}</span></p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 font-semibold">End</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment ref</th>
                </tr>
              </thead>
              <tbody>
                {activeSubs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      Aucune souscription active.
                    </td>
                  </tr>
                ) : (
                  activeSubs.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{s.planName}</div>
                        <div className="text-xs text-gray-500">{s.planId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{s.startDate}</td>
                      <td className="px-4 py-3 text-gray-700">{s.endDate}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                          active
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{s.paymentReference}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

