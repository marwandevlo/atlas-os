import type { AtlasInvoice } from '@/app/types/atlas-invoice';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';

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

