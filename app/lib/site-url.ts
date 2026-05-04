/**
 * Canonical site origin for Supabase auth redirects (password reset, etc.).
 *
 * - Local: set NEXT_PUBLIC_SITE_URL=http://localhost:3000
 * - Production: set NEXT_PUBLIC_SITE_URL=https://zafirixpro.com
 *
 * On the client, falls back to window.location.origin when unset (same tab only).
 */
export function getAuthSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}
