import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasClient = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  paymentTerms: AtlasPaymentTerms;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

