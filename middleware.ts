import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { isOwnerEmail } from '@/app/lib/owner';

const PUBLIC_PATHS = new Set([
  '/landing',
  '/pricing',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/access-denied',
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // allow next internals + static
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/zafirix-')) return true;
  if (pathname === '/favicon.ico') return true;
  if (pathname === '/manifest.json') return true;
  if (pathname.startsWith('/robots.txt')) return true;
  if (pathname.startsWith('/sitemap')) return true;
  return false;
}

function isAdminFromUser(user: User | null): boolean {
  if (!user) return false;
  const meta = user.app_metadata as Record<string, unknown> | undefined;
  const r = String(meta?.role ?? '');
  return r === 'admin' || r === 'owner';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  // Anonymous analytics (POST + preflight) — must not require a logged-in session.
  if (pathname === '/api/analytics/track' || pathname === '/api/funnel/track') {
    return NextResponse.next();
  }

  // Scheduled lifecycle emails (cron) — uses CRON_SECRET inside the route handler.
  if (pathname === '/api/cron/email-lifecycle') {
    return NextResponse.next();
  }

  // Paddle webhooks — verified with PADDLE_WEBHOOK_SECRET inside the route handler.
  if (pathname === '/api/webhooks/paddle') {
    return NextResponse.next();
  }

  // Production safety: if Supabase isn't enabled for any reason, do NOT allow access
  // to private routes. Send visitors to the public landing page.
  if (process.env.NODE_ENV === 'production' && atlasDataBackend() !== 'supabase') {
    const url = request.nextUrl.clone();
    url.pathname = '/landing';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  // Admin pages must never fall back to client-side "demo" behavior.
  // If the backend isn't Supabase, deny access to /admin entirely.
  if (pathname.startsWith('/admin') && atlasDataBackend() !== 'supabase') {
    // LOCAL TESTING ONLY:
    // Allow opening /admin/* in local development when explicitly enabled.
    // The actual "admin" decision in this mode is enforced client-side via localStorage.
    // Production security is still enforced by Supabase JWT role checks.
    const localAdminEnabled =
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_ATLAS_ENABLE_LOCAL_ADMIN === 'true';

    if (!localAdminEnabled) {
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      return NextResponse.redirect(url);
    }
  }

  // Keep project stable: only enforce server-side auth for non-admin pages
  // when Supabase backend is enabled.
  if (atlasDataBackend() !== 'supabase') return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Require login for private pages. Public routes (e.g. /landing, /login) already returned above — no loop on `next`.
  if (!user) {
    const url = request.nextUrl.clone();
    // Public entry point should be the landing page in production.
    url.pathname = '/landing';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Owner must never be blocked (fast path; avoids relying on JWT metadata/DB).
    if (isOwnerEmail(user.email ?? null)) {
      return response;
    }

    // Prefer app_metadata.role, but allow a DB-backed admin role as fallback.
    // This keeps admin access manageable via `profiles.role` without relying solely on JWT metadata.
    let isAdmin = isAdminFromUser(user);
    if (!isAdmin) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
      if (serviceRoleKey) {
        try {
          const adminClient = createServerClient(supabaseUrl, serviceRoleKey, {
            cookies: {
              getAll: () => [],
              setAll: () => {},
            },
          });
          const { data: prof } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          const r = String((prof as { role?: string | null } | null)?.role ?? '');
          isAdmin = r === 'admin' || r === 'owner';
        } catch {
          // ignore; fall back to app_metadata only
        }
      }
    }

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
      Run on all routes except:
      - static files
      - image optimization
    */
    '/((?!_next/static|_next/image|favicon\\.ico|zafirix-favicon\\.png|zafirix-icon-192\\.png|zafirix-icon-512\\.png).*)',
  ],
};

