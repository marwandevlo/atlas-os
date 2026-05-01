import type { AtlasClient } from '@/app/types/atlas-client';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import { requireSupabaseUser } from '@/app/lib/atlas-supabase-guard';
import { asRecord } from '@/app/lib/atlas-json';

export function readClientsFromLocalStorage(): AtlasClient[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.clients);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasClient[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeClientsToLocalStorage(clients: AtlasClient[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.clients, JSON.stringify(clients));
}

export async function listAtlasClients(): Promise<AtlasClient[]> {
  if (!isAtlasSupabaseDataEnabled()) return readClientsFromLocalStorage();

  const auth = await requireSupabaseUser();
  if (!auth.ok) return [];

  const { data, error } = await supabase
    .from('atlas_clients')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('atlas_clients list error', error.message);
    return readClientsFromLocalStorage();
  }

  return (data ?? []).map((row: any) => {
    const metadata = asRecord(row.metadata);
    return {
      id: String(row.id),
      name: String(row.name ?? ''),
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      address: row.address ?? undefined,
      city: row.city ?? undefined,
      paymentTerms: { kind: 'custom', days: Number(row.payment_terms_days ?? 30) },
      balance: Number(row.balance_mad ?? 0),
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
      ...(metadata ? { metadata } as any : {}),
    } satisfies AtlasClient;
  });
}

export async function upsertAtlasClient(client: AtlasClient, opts?: { companyId?: string | null }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    const existing = readClientsFromLocalStorage();
    const next = existing.some((c) => c.id === client.id)
      ? existing.map((c) => (c.id === client.id ? client : c))
      : [...existing, client];
    writeClientsToLocalStorage(next);
    return { ok: true };
  }

  const auth = await requireSupabaseUser();
  if (!auth.ok) return { ok: false, error: 'auth_required' };

  const id = typeof client.id === 'string' ? client.id : undefined;
  const { error } = await supabase.from('atlas_clients').upsert({
    ...(id ? { id } : {}),
    user_id: auth.userId,
    company_id: opts?.companyId ?? null,
    name: client.name,
    email: client.email ?? null,
    phone: client.phone ?? null,
    address: client.address ?? null,
    city: client.city ?? null,
    payment_terms_days: (client.paymentTerms?.days ?? 30),
    balance_mad: client.balance ?? 0,
    metadata: (client as any).metadata ?? {},
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

