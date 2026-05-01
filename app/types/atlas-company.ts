/**
 * Canonical company shape used across ZAFIRIX PRO (localStorage today, Supabase JSON tomorrow).
 */
import type { AtlasPaymentTerms } from '@/app/types/atlas-payment-terms';

export type AtlasCompany = {
  id: number;
  raisonSociale: string;
  formeJuridique: string;
  if_fiscal: string;
  ice: string;
  rc: string;
  cnss: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  activite: string;
  regimeTVA: string;
  actif: boolean;

  /** Default payment terms for invoices emitted by this company. */
  paymentTerms?: AtlasPaymentTerms;

  /** Current balance snapshot (MAD). */
  balance?: number;
};
