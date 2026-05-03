'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';

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

/**
 * Triggers welcome email once per browser session when the user is authenticated (Supabase).
 * Idempotent server-side; safe to call from multiple pages.
 */
export function EmailLifecycleBootstrap() {
  const pathname = usePathname() || '/';
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAtlasSupabaseDataEnabled() || attempted.current) return;
    if (isPublicPath(pathname)) return;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      if (typeof window !== 'undefined' && sessionStorage.getItem('atlas_welcome_email_ping')) {
        attempted.current = true;
        return;
      }
      if (typeof window !== 'undefined') sessionStorage.setItem('atlas_welcome_email_ping', '1');
      attempted.current = true;
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    })();
  }, [pathname]);

  return null;
}
