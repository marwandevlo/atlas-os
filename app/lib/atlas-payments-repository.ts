import type { AtlasPayment } from '@/app/types/atlas-payment';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import { requireSupabaseUser } from '@/app/lib/atlas-supabase-guard';
import { asRecord } from '@/app/lib/atlas-json';

export function readPaymentsFromLocalStorage(): AtlasPayment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.payments);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasPayment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePaymentsToLocalStorage(payments: AtlasPayment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.payments, JSON.stringify(payments));
}

export async function listAtlasPayments(params?: { invoiceId?: string }): Promise<AtlasPayment[]> {
  if (!isAtlasSupabaseDataEnabled()) return readPaymentsFromLocalStorage();

  const auth = await requireSupabaseUser();
  if (!auth.ok) return [];

  let q = supabase.from('atlas_payments').select('*').order('created_at', { ascending: true });
  if (params?.invoiceId) q = q.eq('invoice_id', params.invoiceId);

  const { data, error } = await q;
  if (error) {
    console.error('atlas_payments list error', error.message);
    // In Supabase mode, localStorage must not be treated as a source of truth.
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>): AtlasPayment => {
    const metadata = asRecord(row.metadata);
    const cid = row.company_id;
    const pa = row.paid_at;
    const nt = row.note;
    return {
      id: String(row.id),
      companyId: cid == null ? null : String(cid),
      invoiceId: String(row.invoice_id),
      paidAmount: Number(row.paid_amount ?? 0),
      paidAt: pa == null || pa === '' ? undefined : String(pa),
      note: nt == null || nt === '' ? undefined : String(nt),
      metadata,
      createdAt: String(row.created_at ?? new Date().toISOString()),
      updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
    };
  });
}

export async function upsertAtlasPayment(payment: AtlasPayment): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    const existing = readPaymentsFromLocalStorage();
    const next = existing.some((p) => p.id === payment.id)
      ? existing.map((p) => (p.id === payment.id ? payment : p))
      : [...existing, payment];
    writePaymentsToLocalStorage(next);
    return { ok: true };
  }

  const auth = await requireSupabaseUser();
  if (!auth.ok) return { ok: false, error: 'auth_required' };

  const { error } = await supabase.from('atlas_payments').upsert({
    id: payment.id,
    user_id: auth.userId,
    company_id: payment.companyId ?? null,
    invoice_id: payment.invoiceId,
    paid_amount: payment.paidAmount,
    paid_at: payment.paidAt ?? null,
    note: payment.note ?? null,
    metadata: payment.metadata ?? {},
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAtlasPayment(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    writePaymentsToLocalStorage(readPaymentsFromLocalStorage().filter((p) => p.id !== id));
    return { ok: true };
  }

  const auth = await requireSupabaseUser();
  if (!auth.ok) return { ok: false, error: 'auth_required' };

  const { error } = await supabase.from('atlas_payments').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

