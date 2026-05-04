import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In server components, setting cookies may be a no-op depending on runtime.
        // Route handlers and middleware should handle writing cookies.
        for (const { name, value, options } of cookiesToSet) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore
          }
        }
      },
    },
  });
}

export async function getServerUser() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function isAdminFromUser(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  const r = String(user.app_metadata?.role ?? '');
  return r === 'admin' || r === 'owner';
}

