import { NextRequest, NextResponse } from 'next/server';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { getSupabaseServiceRoleClient } from '@/app/lib/supabase-admin';
import { requireAdmin } from '@/app/lib/admin/require-admin';

type AdminLogRow = {
  id: string;
  admin_id: string;
  target_user_id: string | null;
  action: string;
  details: unknown;
  created_at: string;
};

export async function GET(request: NextRequest) {
  try {
    if (atlasDataBackend() !== 'supabase') return NextResponse.json({ error: 'not_enabled' }, { status: 400 });

    const guard = await requireAdmin(request);
    if (!guard.ok) return guard.response;

    const admin = getSupabaseServiceRoleClient();
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();

    const query = admin
      .from('admin_logs')
      .select('id, admin_id, target_user_id, action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    // Minimal search (client-side filter for broad compatibility).
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

    const rows = (data ?? []) as AdminLogRow[];
    const logs = rows.filter((r) => {
      if (!q) return true;
      const hay = `${r.action ?? ''} ${r.admin_id ?? ''} ${r.target_user_id ?? ''}`.toLowerCase();
      return hay.includes(q);
    });

    return NextResponse.json({ logs });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    return NextResponse.json({ error: 'server_error', message }, { status: 500 });
  }
}

