/**
 * Accounting line (journal) — aligned with comptabilité UI; persisted as JSON in Supabase.
 */
export type AtlasAccountingEntry = {
  id: number;
  date: string;
  libelle: string;
  compte: string;
  debit: number;
  credit: number;
};
