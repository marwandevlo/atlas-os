import { supabase } from '@/app/lib/supabase';

export async function requireSupabaseUser(): Promise<{ ok: true; userId: string } | { ok: false; userId?: undefined }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  return { ok: true, userId: user.id };
}

