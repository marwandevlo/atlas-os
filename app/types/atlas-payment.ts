export type AtlasPayment = {
  id: string;
  companyId?: string | null;
  invoiceId: string;

  paidAmount: number;
  paidAt?: string;
  note?: string;
  metadata?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
};

