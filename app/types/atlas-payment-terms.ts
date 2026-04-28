export type AtlasPaymentTermsPreset = 30 | 60 | 90;

export type AtlasPaymentTerms =
  | { kind: 'preset'; days: AtlasPaymentTermsPreset }
  | { kind: 'custom'; days: number };

export function normalizePaymentTerms(terms: AtlasPaymentTerms): AtlasPaymentTerms {
  const days = Math.max(0, Math.floor(terms.days));
  return terms.kind === 'preset'
    ? ({ kind: 'preset', days: (days === 30 || days === 60 || days === 90 ? days : 30) } as const)
    : ({ kind: 'custom', days } as const);
}

export function paymentTermsLabel(terms: AtlasPaymentTerms): string {
  if (terms.kind === 'preset') return `${terms.days} jours`;
  return `${terms.days} jours (personnalisé)`;
}

