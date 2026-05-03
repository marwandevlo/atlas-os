'use client';

import dynamic from 'next/dynamic';
import { ATLAS_INCIDENT_HOTFIX_GROWTH } from '@/app/lib/atlas-hotfix';

const ManualShell = dynamic(
  () =>
    import('@/app/components/subscription/AppManualSubscriptionShell').then((m) => ({
      default: m.AppManualSubscriptionShell,
    })),
  { ssr: false },
);

export function AppSubscriptionProviders({ children }: { children: React.ReactNode }) {
  if (ATLAS_INCIDENT_HOTFIX_GROWTH) {
    return <>{children}</>;
  }
  return <ManualShell>{children}</ManualShell>;
}
