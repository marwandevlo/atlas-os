'use client';

import { ManualSubscriptionBanners } from '@/app/components/subscription/ManualSubscriptionBanners';
import { ManualSubscriptionProvider } from '@/app/components/subscription/manual-subscription-context';

export function AppManualSubscriptionShell({ children }: { children: React.ReactNode }) {
  return (
    <ManualSubscriptionProvider>
      <ManualSubscriptionBanners />
      {children}
    </ManualSubscriptionProvider>
  );
}
