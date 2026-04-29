import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasInvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export type AtlasInvoiceUiStatut = 'payée' | 'en attente' | 'en retard';

export type AtlasInvoice = {
  id: number;
  number: string;
  clientName: string;
  issueDate: string; // YYYY-MM-DD
  paymentTerms: AtlasPaymentTerms;
  dueDate: string; // YYYY-MM-DD
  status: AtlasInvoiceStatus;

  /**
   * UI-facing status (French) stored for explicit operator overrides.
   * If omitted, UI can derive it from `status` + due date.
   */
  statut?: AtlasInvoiceUiStatut;

  amountHT: number;
  vatRate: number; // 0..1
  vatAmount: number;
  totalTTC: number;

  paidAt?: string;
  paidAmount?: number;

  createdAt: string;
  updatedAt: string;
};

