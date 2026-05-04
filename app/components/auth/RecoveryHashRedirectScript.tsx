'use client';

import { useEffect } from 'react';

export function RecoveryHashRedirectScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    const pathname = window.location.pathname || '';

    if (!hash) return;
    if (pathname === '/reset-password') return;

    if (hash.includes('access_token=') && hash.includes('type=recovery')) {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  return null;
}
