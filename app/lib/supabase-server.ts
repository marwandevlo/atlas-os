import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Next.js 16+ may return a Promise in some runtimes; normalize with await at callsites.
  // This helper is primarily used in server components; route handlers/middleware should
  // create their own SSR client with the request/response cookies.
  const cookieStore = cookies() as any;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll?.() ?? [];
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
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function isAdminFromUser(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  return (user.app_metadata as any)?.role === 'admin';
}

