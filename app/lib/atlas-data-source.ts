/**
 * Feature flag: keep `local` default so production behaviour is unchanged until you
 * run the Supabase migration, enable RLS, and flip this to `supabase`.
 */
export function atlasDataBackend(): 'local' | 'supabase' {
  const v = (process.env.NEXT_PUBLIC_ATLAS_DATA_BACKEND ?? 'local').toLowerCase();
  return v === 'supabase' ? 'supabase' : 'local';
}

export function isAtlasSupabaseDataEnabled(): boolean {
  return atlasDataBackend() === 'supabase';
}
