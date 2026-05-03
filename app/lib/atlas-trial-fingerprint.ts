/**
 * Lightweight client hint for trial anti-abuse (not secret; combined with IP/email server-side).
 */
export function getAtlasTrialDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';
  try {
    const ua = navigator.userAgent || '';
    const lang = navigator.language || '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const screen = `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`;
    const depth = String(window.screen?.colorDepth ?? '');
    const raw = [ua, lang, tz, screen, depth].join('|');
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
    }
    return `fp_${(h >>> 0).toString(16)}_${raw.length}`;
  } catch {
    return '';
  }
}
