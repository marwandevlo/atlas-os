import type { AtlasInvoice } from '@/app/types/atlas-invoice';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import { requireSupabaseUser } from '@/app/lib/atlas-supabase-guard';
import { asRecord } from '@/app/lib/atlas-json';

export function readInvoicesFromLocalStorage(): AtlasInvoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.invoices);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasInvoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeInvoicesToLocalStorage(invoices: AtlasInvoice[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.invoices, JSON.stringify(invoices));
}

export async function listAtlasInvoices(): Promise<AtlasInvoice[]> {
  if (!isAtlasSupabaseDataEnabled()) return readInvoicesFromLocalStorage();

  const auth = await requireSupabaseUser();
  if (!auth.ok) return [];

  const { data, error } = await supabase
    .from('atlas_invoices')
    .select('*')
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('atlas_invoices list error', error.message);
    return readInvoicesFromLocalStorage();
  }

  return (data ?? []).map((row: any) => {
    const metadata = asRecord(row.metadata);
    return {
      id: String(row.id),
      number: String(row.number ?? ''),
      clientName: String(row.client_name ?? ''),
      issueDate: String(row.issue_date),
      paymentTerms: { kind: 'custom', days: Number(row.payment_terms_days ?? 30) },
      dueDate: String(row.due_date),
      status: (row.status ?? 'sent') as AtlasInvoice['status'],
      amountHT: Number(row.amount_ht ?? 0),
      vatRate: Number(row.vat_rate ?? 0),
      vatAmount: Number(row.vat_amount ?? 0),
      totalTTC: Number(row.total_ttc ?? 0),
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
      ...(metadata ? { metadata } as any : {}),
    } satisfies AtlasInvoice;
  });
}

export async function upsertAtlasInvoice(invoice: AtlasInvoice, opts?: { companyId?: string | null; clientId?: string | null }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    const existing = readInvoicesFromLocalStorage();
    const next = existing.some((i) => i.id === invoice.id)
      ? existing.map((i) => (i.id === invoice.id ? invoice : i))
      : [...existing, invoice];
    writeInvoicesToLocalStorage(next);
    return { ok: true };
  }

  const auth = await requireSupabaseUser();
  if (!auth.ok) return { ok: false, error: 'auth_required' };

  const id = typeof invoice.id === 'string' ? invoice.id : undefined;
  const { error } = await supabase.from('atlas_invoices').upsert({
    ...(id ? { id } : {}),
    user_id: auth.userId,
    company_id: opts?.companyId ?? null,
    client_id: opts?.clientId ?? null,
    number: invoice.number,
    client_name: invoice.clientName,
    issue_date: invoice.issueDate,
    payment_terms_days: invoice.paymentTerms.days ?? 30,
    due_date: invoice.dueDate,
    amount_ht: invoice.amountHT,
    vat_rate: invoice.vatRate,
    vat_amount: invoice.vatAmount,
    total_ttc: invoice.totalTTC,
    status: invoice.status,
    metadata: (invoice as any).metadata ?? {},
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAtlasInvoice(id: AtlasInvoice['id']): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    writeInvoicesToLocalStorage(readInvoicesFromLocalStorage().filter((inv) => inv.id !== id));
    return { ok: true };
  }

  const auth = await requireSupabaseUser();
  if (!auth.ok) return { ok: false, error: 'auth_required' };

  if (typeof id !== 'string') return { ok: false, error: 'invalid_id' };
  const { error } = await supabase.from('atlas_invoices').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

