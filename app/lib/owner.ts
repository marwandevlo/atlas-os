export const OWNER_EMAIL = 'maizimarouane1991@gmail.com';

export function isOwnerEmail(email: string | null | undefined): boolean {
  return String(email ?? '')
    .trim()
    .toLowerCase() === OWNER_EMAIL;
}

/**
 * Client-side flag set by EmailLifecycleBootstrap for quick synchronous checks
 * (e.g. usage limits / upgrade nudges). Do not use this for server authorization.
 */
export const OWNER_SESSION_KEY = 'atlas_owner';

export function isOwnerSessionFlagSet(): boolean {
  if (typeof window === 'undefined') return false;
  return (sessionStorage.getItem(OWNER_SESSION_KEY) ?? '') === '1';
}

