/** Single source of truth for browser persistence keys (localStorage migration). */
export const ATLAS_STORAGE_KEYS = {
  companies: 'atlas_companies',
  activeCompany: 'atlas_company',
  accountingEntries: 'atlas_accounting_entries',
} as const;
