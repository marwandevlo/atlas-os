import type { AtlasInvoice, AtlasInvoiceUiStatut } from '@/app/types/atlas-invoice';
import { isOverdue, todayYmd } from '@/app/lib/atlas-dates';

export type FrontendInvoice = {
  id: number;
  montant: number;
  statut: AtlasInvoiceUiStatut;
  date_emission: string;
  date_echeance: string;
};

export function computeInvoiceStatut(inv: AtlasInvoice, nowYmd: string = todayYmd()): AtlasInvoiceUiStatut {
  if (inv.statut) return inv.statut;
  const paid = inv.status === 'paid';
  if (paid) return 'payée';
  return isOverdue(inv.dueDate, false, nowYmd) ? 'en retard' : 'en attente';
}

export function toFrontendInvoice(inv: AtlasInvoice, nowYmd: string = todayYmd()): FrontendInvoice {
  return {
    id: inv.id,
    montant: inv.totalTTC ?? 0,
    statut: computeInvoiceStatut(inv, nowYmd),
    date_emission: inv.issueDate,
    date_echeance: inv.dueDate,
  };
}

export function applyUiStatut(inv: AtlasInvoice, statut: AtlasInvoiceUiStatut, nowYmd: string = todayYmd()): AtlasInvoice {
  const nowIso = new Date().toISOString();
  if (statut === 'payée') {
    return {
      ...inv,
      statut,
      status: 'paid',
      paidAt: inv.paidAt ?? nowYmd,
      paidAmount: inv.paidAmount ?? inv.totalTTC,
      updatedAt: nowIso,
    };
  }

  // unpaid statuses keep `status` as `sent` (backward compatible)
  return {
    ...inv,
    statut,
    status: inv.status === 'paid' ? 'sent' : inv.status,
    paidAt: undefined,
    paidAmount: undefined,
    updatedAt: nowIso,
  };
}

