'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import {
  buildManualSubscriptionWhatsAppUrl,
  getManualWhatsAppPhoneDigits,
  planDisplayName,
} from '@/app/lib/atlas-manual-subscription';
import { setReferralExtraCompanySlotsFromServer } from '@/app/lib/atlas-referral-bonus-state';

export type ManualSubscriptionSnapshot = {
  id: string;
  plan: string;
  status: string;
  created_at: string;
};

type ManualSubscriptionContextValue = {
  loading: boolean;
  pendingManual: boolean;
  latestPending: ManualSubscriptionSnapshot | null;
  hasAtlasEntitlement: boolean;
  /** True when a manual request is pending and the user has no trial/active Atlas subscription. */
  blockPremiumActions: boolean;
  userEmail: string | null;
  refresh: () => Promise<void>;
  buildWhatsAppUrl: (planLabel: string) => string | null;
};

const ManualSubscriptionContext = createContext<ManualSubscriptionContextValue | null>(null);

const PUBLIC_PREFIXES = [
  '/landing',
  '/pricing',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/access-denied',
  '/payment',
  '/_next',
];

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return false;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function ManualSubscriptionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const [loading, setLoading] = useState(true);
  const [latestPending, setLatestPending] = useState<ManualSubscriptionSnapshot | null>(null);
  const [hasAtlasEntitlement, setHasAtlasEntitlement] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAtlasSupabaseDataEnabled()) {
      setReferralExtraCompanySlotsFromServer(0);
      setLoading(false);
      setLatestPending(null);
      setHasAtlasEntitlement(true);
      setUserEmail(null);
      return;
    }
    if (isPublicPath(pathname)) {
      setReferralExtraCompanySlotsFromServer(0);
      setLoading(false);
      setLatestPending(null);
      setHasAtlasEntitlement(true);
      setUserEmail(null);
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const email = sessionData.session?.user?.email?.trim() ?? null;
      setUserEmail(email);
      if (!token) {
        setReferralExtraCompanySlotsFromServer(0);
        setLatestPending(null);
        setHasAtlasEntitlement(true);
        return;
      }

      const [manualRes, atlasRes] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('id, plan, status, created_at')
          .eq('status', 'pending_manual')
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('atlas_subscriptions')
          .select('status, metadata')
          .in('status', ['trial', 'active'])
          .limit(20),
      ]);

      const manualRows = manualRes.data ?? [];
      const pending = manualRows[0]
        ? {
            id: String(manualRows[0].id),
            plan: String(manualRows[0].plan ?? ''),
            status: String(manualRows[0].status ?? ''),
            created_at: String(manualRows[0].created_at ?? ''),
          }
        : null;
      setLatestPending(pending);

      const atlasRows = atlasRes.data ?? [];
      let referralSlots = 0;
      for (const r of atlasRows) {
        const meta = (r as { metadata?: Record<string, unknown> }).metadata;
        const n = Number(meta?.referral_extra_company_slots);
        if (Number.isFinite(n) && n > referralSlots) referralSlots = Math.min(500, Math.floor(n));
      }
      setReferralExtraCompanySlotsFromServer(referralSlots);
      const entitled = atlasRows.some((r) => {
        const s = String((r as { status?: string }).status ?? '');
        return s === 'trial' || s === 'active';
      });
      setHasAtlasEntitlement(entitled);
    } catch {
      setReferralExtraCompanySlotsFromServer(0);
      setLatestPending(null);
      setHasAtlasEntitlement(true);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pendingManual = !!latestPending;

  const blockPremiumActions = pendingManual && !hasAtlasEntitlement;

  const buildWhatsAppUrl = useCallback(
    (planLabel: string) => {
      if (!userEmail) return null;
      return buildManualSubscriptionWhatsAppUrl({
        phoneDigits: getManualWhatsAppPhoneDigits(),
        planLabel,
        userEmail,
      });
    },
    [userEmail],
  );

  const value = useMemo((): ManualSubscriptionContextValue => {
    return {
      loading,
      pendingManual,
      latestPending,
      hasAtlasEntitlement,
      blockPremiumActions,
      userEmail,
      refresh,
      buildWhatsAppUrl,
    };
  }, [loading, pendingManual, latestPending, hasAtlasEntitlement, blockPremiumActions, userEmail, refresh, buildWhatsAppUrl]);

  return <ManualSubscriptionContext.Provider value={value}>{children}</ManualSubscriptionContext.Provider>;
}

export function useManualSubscription(): ManualSubscriptionContextValue {
  const ctx = useContext(ManualSubscriptionContext);
  if (!ctx) {
    return {
      loading: false,
      pendingManual: false,
      latestPending: null,
      hasAtlasEntitlement: true,
      blockPremiumActions: false,
      userEmail: null,
      refresh: async () => {},
      buildWhatsAppUrl: () => null,
    };
  }
  return ctx;
}

export function planLabelFromSnapshot(row: ManualSubscriptionSnapshot | null): string {
  if (!row) return 'ZAFIRIX PRO';
  return planDisplayName(row.plan);
}
