import type { AtlasInvoice } from '@/app/types/atlas-invoice';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { supabase } from '@/app/lib/supabase';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';

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

export function shouldSeedDemoInvoices(): boolean {
  return !isAtlasSupabaseDataEnabled();
}

type AtlasInvoicesRow = {
  legacy_local_id: number | null;
  montant: number | string | null;
  statut: string | null;
  date_emission: string | null;
  date_echeance: string | null;
  invoice_json: unknown;
};

function asAtlasInvoice(row: AtlasInvoicesRow): AtlasInvoice | null {
  const j = row.invoice_json as AtlasInvoice | null;
  if (j && typeof j === 'object' && typeof (j as any).id === 'number') return j;
  if (typeof row.legacy_local_id !== 'number') return null;

  const totalTTC = typeof row.montant === 'number' ? row.montant : Number.parseFloat(String(row.montant ?? '0')) || 0;
  const issueDate = row.date_emission ?? '';
  const dueDate = row.date_echeance ?? '';
  const status = (row.statut ?? 'sent') as AtlasInvoice['status'];
  const now = new Date().toISOString();

  return {
    id: row.legacy_local_id,
    number: `F-${row.legacy_local_id}`,
    clientName: '',
    issueDate,
    paymentTerms: { kind: 'preset', days: 30 },
    dueDate,
    status,
    amountHT: totalTTC,
    vatRate: 0,
    vatAmount: 0,
    totalTTC,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Lists invoices for the signed-in user. When `NEXT_PUBLIC_ATLAS_DATA_BACKEND=supabase`,
 * reads from `public.atlas_invoices`; otherwise returns localStorage snapshot.
 */
export async function listAtlasInvoices(): Promise<AtlasInvoice[]> {
  if (!isAtlasSupabaseDataEnabled()) {
    return readInvoicesFromLocalStorage();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('atlas_invoices')
    .select('legacy_local_id, montant, statut, date_emission, date_echeance, invoice_json')
    .order('date_emission', { ascending: true });

  if (error) {
    console.error('atlas_invoices list error', error.message);
    return readInvoicesFromLocalStorage();
  }

  return (data ?? [])
    .map((row) => asAtlasInvoice(row as AtlasInvoicesRow))
    .filter((inv): inv is AtlasInvoice => inv !== null);
}

export async function upsertAtlasInvoice(invoice: AtlasInvoice): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    const existing = readInvoicesFromLocalStorage();
    const next = existing.some((i) => i.id === invoice.id)
      ? existing.map((i) => (i.id === invoice.id ? invoice : i))
      : [...existing, invoice];
    writeInvoicesToLocalStorage(next);
    return { ok: true };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  const { error } = await supabase
    .from('atlas_invoices')
    .upsert({
      user_id: user.id,
      legacy_local_id: invoice.id,
      montant: invoice.totalTTC ?? 0,
      statut: invoice.status ?? 'sent',
      date_emission: invoice.issueDate || null,
      date_echeance: invoice.dueDate || null,
      invoice_json: invoice,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,legacy_local_id' });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAtlasInvoice(legacyLocalId: number): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    const next = readInvoicesFromLocalStorage().filter((i) => i.id !== legacyLocalId);
    writeInvoicesToLocalStorage(next);
    return { ok: true };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  const { error } = await supabase
    .from('atlas_invoices')
    .delete()
    .eq('user_id', user.id)
    .eq('legacy_local_id', legacyLocalId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

