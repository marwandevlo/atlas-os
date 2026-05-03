import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { activateReferralForUser } from '@/app/lib/atlas-referral-server';

export async function POST() {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!serviceRoleKey) {
    return NextResponse.json({ ok: false, error: 'misconfigured' }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabaseUser = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const { data: authData, error: authErr } = await supabaseUser.auth.getUser();
  const user = authData?.user;
  if (authErr || !user?.id) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const result = await activateReferralForUser(admin, user.id);
    if (!result.ok) {
      return NextResponse.json({ ok: true, activated: false, reason: result.reason });
    }
    return NextResponse.json({
      ok: true,
      activated: true,
      already: result.already,
      rewardGranted: result.rewardGranted,
      activatedCount: result.activatedCount,
      tierDeltaDays: result.tierDeltaDays,
      bonusFeaturesUnlocked: result.bonusFeaturesUnlocked,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
