import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasSupplierInvoiceStatus = 'unpaid' | 'paid';

export type AtlasSupplierInvoice = {
  id: number;
  supplierName: string;
  invoiceNumber?: string;
  issueDate: string; // YYYY-MM-DD
  amountHT?: number;
  vatAmount?: number;
  totalTTC: number;
  paymentTerms: AtlasPaymentTerms;
  dueDate: string; // YYYY-MM-DD
  status: AtlasSupplierInvoiceStatus;
  paidAt?: string; // YYYY-MM-DD
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

