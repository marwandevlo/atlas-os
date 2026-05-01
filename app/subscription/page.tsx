'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Clock, CreditCard, HelpCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
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
  status: 'active' | 'trial';
  paymentReference: string;
  createdAt: string;
};

const STORAGE = {
  pending: 'atlas_pending_subscriptions',
  active: 'atlas_active_subscriptions',
} as const;

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
    const provider =
      p.manualProvider === 'cashplus'
        ? 'CashPlus'
        : p.manualProvider === 'wafacash'
          ? 'WafaCash'
          : p.manualProvider === 'western_union'
            ? 'Western Union'
            : 'Manual';
    return `Manual · ${provider}`;
  }
  return p.paymentMethod;
}

export default function SubscriptionPage() {
  const router = useRouter();

  const [activeSubs, setActiveSubs] = useState<ActiveSubscription[]>(() => readJsonArray<ActiveSubscription>(STORAGE.active));
  const [pendingReqs, setPendingReqs] = useState<PendingSubscription[]>(() => readJsonArray<PendingSubscription>(STORAGE.pending));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError('');
      if (!isAtlasSupabaseDataEnabled()) return;

      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token ?? '';
        if (!token) {
          router.push('/login?next=/subscription');
          return;
        }

        const [reqRes, subRes] = await Promise.all([
          supabase
            .from('atlas_payment_requests')
            .select('id, plan_id, amount_mad, currency, billing_period, payment_method, manual_provider, status, created_at')
            .in('status', ['pending', 'paid'])
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('atlas_subscriptions')
            .select('id, plan_id, status, start_date, end_date, payment_request_id, created_at')
            .in('status', ['trial', 'active'])
            .order('created_at', { ascending: false })
            .limit(1),
        ]);

        if (reqRes.error || subRes.error) throw new Error('db_error');

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
          status: String(s.status) as any,
          paymentReference: String(s.payment_request_id ?? ''),
          createdAt: String(s.created_at ?? new Date().toISOString()),
        }));

        if (!cancelled) {
          setPendingReqs(reqs);
          setActiveSubs(subs);
        }

        // Keep existing app behavior stable: many widgets read subscription/payment state
        // from localStorage. In Supabase mode, treat localStorage as a cache synced from DB,
        // not a source of truth.
        writeJsonArray(STORAGE.pending, reqs);
        writeJsonArray(STORAGE.active, subs);
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
  }, [router]);

  const active = useMemo(() => {
    const list = activeSubs.filter((s) => s.status === 'active' || s.status === 'trial');
    return list[0] ?? null;
  }, [activeSubs]);

  const pending = useMemo(() => {
    // choose most recent actionable request (pending/paid), ignore rejected/active
    const actionable = pendingReqs.filter((p) => p.status === 'pending' || p.status === 'paid');
    const sorted = [...actionable].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return sorted[0] ?? null;
  }, [pendingReqs]);

  const supportEmail = 'contact@zafirix.group';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
        <p className="text-sm font-semibold text-gray-900">Subscription · الاشتراك</p>
        <div />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            Chargement…
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        {active ? (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="px-8 py-7 bg-emerald-50 border-b border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <BadgeCheck size={22} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-emerald-950">تم تفعيل باقتك بنجاح</p>
                  <p className="text-sm text-emerald-900/70 mt-1">Votre abonnement est actif.</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{active.planName}</p>
                  <p className="text-xs text-gray-500 mt-1">{active.planId}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Statut</p>
                  <p className="text-lg font-bold text-emerald-700 mt-1">active</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Start</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{active.startDate}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">End</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{active.endDate}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs text-gray-500">Payment reference</p>
                <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{active.paymentReference}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#1a3060] inline-flex items-center gap-2"
                >
                  الذهاب إلى لوحة التحكم <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Voir les tarifs
                </button>
              </div>
            </div>
          </div>
        ) : pending ? (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="px-8 py-7 bg-amber-50 border-b border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-amber-100 flex items-center justify-center text-amber-800">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-amber-950">طلب الاشتراك في انتظار تأكيد الدفع</p>
                  <p className="text-sm text-amber-900/70 mt-1">Votre demande est en cours de validation.</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Reference / ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{pending.id}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{pending.planName}</p>
                  <p className="text-xs text-gray-500 mt-1">{pending.planId}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Payment method</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <CreditCard size={16} className="text-gray-400" />
                    <span>{prettyMethod(pending)}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-1">
                    {Math.round(pending.amount).toLocaleString()} {pending.currency}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
                <div className="flex items-start gap-3">
                  <HelpCircle size={18} className="mt-0.5 text-amber-800" />
                  <div>
                    <p className="font-semibold">ماذا بعد؟</p>
                    <p className="text-amber-900/80 mt-1">
                      سيتم تفعيل الباقة بعد تأكيد الدفع من طرف الإدارة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(`/payment?plan=${encodeURIComponent(pending.planId)}`)}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-[#0F1F3D] text-sm font-semibold hover:bg-amber-300 inline-flex items-center gap-2"
                >
                  عرض تعليمات الدفع <ArrowRight size={16} />
                </button>
                <a
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent('Support abonnement ZAFIRIX PRO')}&body=${encodeURIComponent(`Bonjour,\\n\\nJ’ai une demande d’abonnement en attente. Référence: ${pending.id}\\nPlan: ${pending.planName} (${pending.planId})\\nMontant: ${pending.amount} ${pending.currency}\\nMéthode: ${prettyMethod(pending)}\\n\\nMerci.`)}`}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  تواصل مع الدعم
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-7 bg-gray-50 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900">ليست لديك باقة مفعلة حالياً</p>
                  <p className="text-sm text-gray-500 mt-1">Vous n’avez pas d’abonnement actif.</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-7">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700">
                اختر باقة تناسب شركتك، ثم أكمل طلب الدفع. يمكنك البدء بتجربة مجانية أو اختيار خطة سنوية.
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#1a3060] inline-flex items-center gap-2"
                >
                  اختيار باقة <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Retour au dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

