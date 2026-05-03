import { ATLAS_STORAGE_KEYS } from '@/app/lib/atlas-storage-keys';

/** Paid extensions for Pro only — not full plans; stack on base 25 sociétés. */
export type AtlasCompanySlotAddonId = 'pro-extra-3' | 'pro-extra-5';

export type AtlasCompanySlotAddon = {
  id: AtlasCompanySlotAddonId;
  labelFr: string;
  descriptionFr: string;
  /** Slots added on top of the Pro plan base (25). */
  extraSlots: number;
  /** Annual add-on price (MAD), billed separately from the main subscription. */
  priceMadYear: number;
  ctaLabel: string;
};

export const ATLAS_COMPANY_SLOT_ADDONS: AtlasCompanySlotAddon[] = [
  {
    id: 'pro-extra-3',
    labelFr: '+3 sociétés',
    descriptionFr: 'Extension Pro — 3 emplacements société supplémentaires pour l’année.',
    extraSlots: 3,
    priceMadYear: 1800,
    ctaLabel: 'Commander +3 sociétés',
  },
  {
    id: 'pro-extra-5',
    labelFr: '+5 sociétés',
    descriptionFr: 'Extension Pro — 5 emplacements société supplémentaires pour l’année.',
    extraSlots: 5,
    priceMadYear: 2600,
    ctaLabel: 'Commander +5 sociétés',
  },
];

export function getCompanyAddonById(id: string): AtlasCompanySlotAddon | undefined {
  return ATLAS_COMPANY_SLOT_ADDONS.find((a) => a.id === id);
}

function normalizeSlots(n: unknown): number {
  const v = typeof n === 'number' ? n : Number.parseInt(String(n), 10);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(500, Math.floor(v));
}

/** Total extra company slots from paid Pro add-ons (localStorage). */
export function getProCompanyAddonExtraSlots(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEYS.proCompanyAddonSlots);
    if (raw == null || raw === '') return 0;
    return normalizeSlots(JSON.parse(raw) as number);
  } catch {
    return 0;
  }
}

export function setProCompanyAddonExtraSlots(total: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATLAS_STORAGE_KEYS.proCompanyAddonSlots, JSON.stringify(normalizeSlots(total)));
}

export function addProCompanyAddonExtraSlots(delta: number): void {
  const next = getProCompanyAddonExtraSlots() + normalizeSlots(delta);
  setProCompanyAddonExtraSlots(next);
}
