import type { AtlasSupplierInvoice } from '@/app/types/atlas-supplier-invoice';
import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';

export function readSupplierInvoicesFromLocalStorage(): AtlasSupplierInvoice[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.supplierInvoices);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AtlasSupplierInvoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSupplierInvoicesToLocalStorage(invoices: AtlasSupplierInvoice[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.supplierInvoices, JSON.stringify(invoices));
}

