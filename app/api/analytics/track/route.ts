import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { checkPaymentRateLimit } from '@/app/lib/payment-rate-limit';

const ALLOWED = new Set([
  'view_landing',
  'click_signup',
  'signup_completed',
  'onboarding_started',
  'onboarding_completed',
  'view_pricing',
  'upgrade_clicked',
  'trial_banner_clicked',
]);

const METADATA_MAX_BYTES = 12_000;

function clientIp(request: NextRequest): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function sanitizeMetadata(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;
  try {
    const s = JSON.stringify(raw);
    if (s.length > METADATA_MAX_BYTES) return null;
    return raw as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ ok: false, error: 'not_enabled' }, { status: 400 });
  }

  const ip = clientIp(request);
  const rate = checkPaymentRateLimit(`analytics_track:${ip}`);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
    );
  }

  const body = (await request.json().catch(() => null)) as null | {
    event?: string;
    anonymousId?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  };

  const event = (body?.event ?? '').trim();
  if (!ALLOWED.has(event)) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });
  }

  const pathRaw = typeof body?.path === 'string' ? body.path.trim().slice(0, 512) : '';
  const path = pathRaw || null;
  const metadata = sanitizeMetadata(body?.metadata);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';

  if (!serviceRoleKey) {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 503 });
  }

  let userId: string | null = null;
  const authHeader = request.headers.get('authorization') ?? '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: auth } = await userClient.auth.getUser();
      userId = auth.user?.id ?? null;
    }
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const row: {
    user_id: string | null;
    event_name: string;
    path: string | null;
    metadata: Record<string, unknown> | null;
  } = {
    user_id: userId,
    event_name: event,
    path,
    metadata,
  };

  const { error } = await admin.from('events').insert(row);

  if (error) {
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
