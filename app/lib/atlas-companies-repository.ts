/**
 * Data-access boundary for companies: today localStorage, tomorrow Supabase (`atlas_companies`).
 * Pages can gradually switch from ad-hoc localStorage reads to these helpers.
 */

import type { AtlasCompany } from '@/app/types/atlas-company';
import { supabase } from '@/app/lib/supabase';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';

export function readCompaniesFromLocalStorage(): AtlasCompany[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.companies);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasCompany[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCompaniesToLocalStorage(companies: AtlasCompany[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.companies, JSON.stringify(companies));
}

export function readActiveCompanyFromLocalStorage(): Partial<AtlasCompany> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.activeCompany);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AtlasCompany>;
  } catch {
    return null;
  }
}

/**
 * Lists companies for the signed-in user. When `NEXT_PUBLIC_ATLAS_DATA_BACKEND=supabase`,
 * reads from `public.atlas_companies`; otherwise returns localStorage snapshot.
 */
export async function listAtlasCompanies(): Promise<AtlasCompany[]> {
  if (!isAtlasSupabaseDataEnabled()) {
    return readCompaniesFromLocalStorage();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('atlas_companies')
    .select('company_json, legacy_local_id')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('atlas_companies list error', error.message);
    return readCompaniesFromLocalStorage();
  }

  return (data ?? [])
    .map((row: { company_json: unknown }) => {
      const j = row.company_json as AtlasCompany | null;
      return j && typeof j === 'object' ? j : null;
    })
    .filter((c): c is AtlasCompany => c !== null);
}
