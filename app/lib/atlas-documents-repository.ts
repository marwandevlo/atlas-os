import type { AtlasDocument } from '@/app/types/atlas-document';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import { requireSupabaseUser } from '@/app/lib/atlas-supabase-guard';
import { asRecord } from '@/app/lib/atlas-json';

export function readDocumentsFromLocalStorage(): AtlasDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.documents);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDocumentsToLocalStorage(documents: AtlasDocument[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.documents, JSON.stringify(documents));
}

export async function listAtlasDocuments(): Promise<AtlasDocument[]> {
  if (!isAtlasSupabaseDataEnabled()) return readDocumentsFromLocalStorage();

  const auth = await requireSupabaseUser();
  if (!auth.ok) return [];

  const { data, error } = await supabase
    .from('atlas_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('atlas_documents list error', error.message);
    return readDocumentsFromLocalStorage();
  }

  return (data ?? []).map((row: any) => {
    const metadata = asRecord(row.metadata);
    return {
      id: String(row.id),
      companyId: row.company_id ?? null,
      type: String(row.type ?? 'generic'),
      title: String(row.title ?? ''),
      content: row.content ?? undefined,
      kind: String(row.kind ?? 'generic'),
      source: String(row.source ?? 'manual'),
      status: String(row.status ?? 'active'),
      metadata,
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    } satisfies AtlasDocument;
  });
}

export async function upsertAtlasDocument(doc: AtlasDocument): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isAtlasSupabaseDataEnabled()) {
    const existing = readDocumentsFromLocalStorage();
    const next = existing.some((d) => d.id === doc.id)
      ? existing.map((d) => (d.id === doc.id ? doc : d))
      : [...existing, doc];
    writeDocumentsToLocalStorage(next);
    return { ok: true };
  }

  const auth = await requireSupabaseUser();
  if (!auth.ok) return { ok: false, error: 'auth_required' };

  const { error } = await supabase.from('atlas_documents').upsert({
    id: doc.id,
    user_id: auth.userId,
    company_id: doc.companyId ?? null,
    type: doc.type ?? 'generic',
    title: doc.title,
    content: doc.content ?? null,
    kind: doc.kind,
    source: doc.source,
    status: doc.status,
    metadata: doc.metadata ?? {},
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Requested API names (clean architecture boundary)
// ---------------------------------------------------------------------------

export async function getDocuments(): Promise<AtlasDocument[]> {
  return listAtlasDocuments();
}

export async function createDocument(input: {
  type: string;
  title: string;
  content: unknown;
  companyId?: string | null;
  metadata?: Record<string, unknown>;
  source?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const now = new Date().toISOString();
  const doc: AtlasDocument = {
    id: crypto.randomUUID(),
    companyId: input.companyId ?? null,
    type: input.type,
    title: input.title,
    content: input.content,
    kind: 'library',
    source: input.source ?? 'generated',
    status: 'active',
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };

  const res = await upsertAtlasDocument(doc);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, id: doc.id };
}

export async function searchDocuments(q: string, opts?: { type?: string }): Promise<AtlasDocument[]> {
  const all = await listAtlasDocuments();
  const needle = (q ?? '').trim().toLowerCase();
  return all.filter((d) => {
    if (opts?.type && d.type !== opts.type) return false;
    if (!needle) return true;
    const hay = `${d.title} ${d.type}`.toLowerCase();
    return hay.includes(needle);
  });
}

