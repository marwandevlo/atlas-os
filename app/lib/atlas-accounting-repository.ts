import type { AtlasAccountingEntry } from '@/app/types/atlas-accounting';
import { supabase } from '@/app/lib/supabase';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';

export function readAccountingFromLocalStorage(): AtlasAccountingEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.accountingEntries);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasAccountingEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeAccountingToLocalStorage(entries: AtlasAccountingEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.accountingEntries, JSON.stringify(entries));
}

/** Reserved for when comptabilité persists lines; same pattern as companies. */
export async function listAtlasAccountingEntries(): Promise<AtlasAccountingEntry[]> {
  if (!isAtlasSupabaseDataEnabled()) {
    return readAccountingFromLocalStorage();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('atlas_accounting_entries')
    .select('entry_json')
    .order('entry_date', { ascending: true });

  if (error) {
    console.error('atlas_accounting_entries list error', error.message);
    return readAccountingFromLocalStorage();
  }

  return (data ?? [])
    .map((row: { entry_json: unknown }) => {
      const j = row.entry_json as AtlasAccountingEntry | null;
      return j && typeof j === 'object' ? j : null;
    })
    .filter((e): e is AtlasAccountingEntry => e !== null);
}
