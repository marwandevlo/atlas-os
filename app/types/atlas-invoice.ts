import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasInvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export type AtlasInvoice = {
  id: number;
  number: string;
  clientName: string;
  issueDate: string; // YYYY-MM-DD
  paymentTerms: AtlasPaymentTerms;
  dueDate: string; // YYYY-MM-DD
  status: AtlasInvoiceStatus;

  amountHT: number;
  vatRate: number; // 0..1
  vatAmount: number;
  totalTTC: number;

  paidAt?: string;
  paidAmount?: number;

  createdAt: string;
  updatedAt: string;
};

