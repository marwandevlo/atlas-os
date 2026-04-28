import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasInvoiceStatus = 'draft' | 'sent' | 'paid';

export type AtlasInvoice = {
  id: number;
  number: string;
  clientName: string;
  issueDate: string; // YYYY-MM-DD
  amountHT: number;
  vatRate: number; // e.g. 0.2
  vatAmount: number;
  totalTTC: number;
  paymentTerms: AtlasPaymentTerms;
  dueDate: string; // YYYY-MM-DD
  status: AtlasInvoiceStatus;
  paidAt?: string; // YYYY-MM-DD
  paidAmount?: number;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

