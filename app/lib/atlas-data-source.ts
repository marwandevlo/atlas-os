/**
 * Feature flag: keep `local` default so production behaviour is unchanged until you
 * run the Supabase migration, enable RLS, and flip this to `supabase`.
 */
export function atlasDataBackend(): 'local' | 'supabase' {
  // Production must never run in demo/local mode.
  // If the env var is missing/misconfigured in production, force Supabase to avoid
  // exposing private app routes to unauthenticated visitors.
  if (process.env.NODE_ENV === 'production') return 'supabase';

  const v = (process.env.NEXT_PUBLIC_ATLAS_DATA_BACKEND ?? 'local').toLowerCase();
  return v === 'supabase' ? 'supabase' : 'local';
}

export function isAtlasSupabaseDataEnabled(): boolean {
  return atlasDataBackend() === 'supabase';
}
