export type AtlasPaymentTermsPreset = 30 | 60 | 90;

export type AtlasPaymentTerms =
  | { kind: 'preset'; days: AtlasPaymentTermsPreset }
  | { kind: 'custom'; days: number };

export function normalizePaymentTerms(terms: AtlasPaymentTerms): AtlasPaymentTerms {
  const rawDays = Number.isFinite(terms.days) ? Math.trunc(terms.days) : 0;
  const days = Math.max(0, rawDays);
  if (terms.kind === 'preset') {
    if (days === 30 || days === 60 || days === 90) return { kind: 'preset', days };
    return { kind: 'preset', days: 30 };
  }
  return { kind: 'custom', days };
}

export function paymentTermsLabel(terms: AtlasPaymentTerms): string {
  const t = normalizePaymentTerms(terms);
  if (t.kind === 'preset') return `${t.days} jours`;
  return t.days > 0 ? `${t.days} jours` : 'Personnalisé';
}

