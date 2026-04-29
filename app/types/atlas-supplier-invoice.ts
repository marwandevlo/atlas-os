import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasSupplierInvoiceStatus = 'unpaid' | 'paid';

export type AtlasSupplierInvoice = {
  id: number;
  supplierName: string;
  invoiceNumber?: string;
  issueDate: string; // YYYY-MM-DD
  paymentTerms: AtlasPaymentTerms;
  dueDate: string; // YYYY-MM-DD
  status: AtlasSupplierInvoiceStatus;

  amountHT?: number;
  vatAmount?: number;
  totalTTC?: number;

  paidAt?: string;
  paidAmount?: number;

  createdAt: string;
  updatedAt: string;
};

