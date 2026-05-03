import { getAtlasTrialDeviceFingerprint } from '@/app/lib/atlas-trial-fingerprint';

export type TrialClaimReason =
  | 'granted'
  | 'already_has_trial'
  | 'already_used_email'
  | 'already_used_device'
  | 'ip_trial_cap'
  | 'email_not_confirmed'
  | 'paid_skip'
  | 'already_had_free_trial_plan'
  | 'service_unavailable';

export function shouldPersistAtlasTrialNotice(r: TrialClaimResult): boolean {
  if (!r.message?.trim()) return false;
  if (r.reason === 'paid_skip' || r.reason === 'already_has_trial' || r.reason === 'already_had_free_trial_plan') return false;
  return true;
}

export type TrialClaimResult = {
  ok: boolean;
  granted: boolean;
  reason: TrialClaimReason;
  message?: string;
};

export async function claimAtlasFreeTrialAfterAuth(): Promise<TrialClaimResult> {
  const fingerprint = getAtlasTrialDeviceFingerprint();
  const res = await fetch('/api/trial/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ deviceFingerprint: fingerprint }),
  });

  const json = (await res.json().catch(() => null)) as null | TrialClaimResult;
  if (!res.ok || !json) {
    return {
      ok: false,
      granted: false,
      reason: 'service_unavailable',
      message:
        json?.message ??
        "Impossible de vérifier l'éligibilité à l'essai pour le moment. Réessayez plus tard ou contactez le support.",
    };
  }
  return json;
}
