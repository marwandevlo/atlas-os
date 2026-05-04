import 'server-only';

import { createClient } from '@supabase/supabase-js';

export function getSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY_not_set');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseUserClientFromBearer(bearerToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

