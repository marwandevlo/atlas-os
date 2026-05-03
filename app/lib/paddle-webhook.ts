import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies Paddle Billing webhook `Paddle-Signature` header (ts + h1).
 * @see https://developer.paddle.com/webhooks/signature-verification
 */
export function verifyPaddleBillingSignature(
  rawBody: string,
  paddleSignatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!secret?.trim()) return false;
  const sig = paddleSignatureHeader?.trim();
  if (!sig) return false;

  let ts = '';
  let h1 = '';
  for (const part of sig.split(';')) {
    const [k, ...rest] = part.split('=');
    const key = k?.trim();
    const val = rest.join('=').trim();
    if (key === 'ts') ts = val;
    if (key === 'h1') h1 = val;
  }
  if (!ts || !h1) return false;

  const signedPayload = `${ts}\n${rawBody}`;
  const expectedHex = createHmac('sha256', secret.trim()).update(signedPayload, 'utf8').digest('hex');

  try {
    const a = Buffer.from(h1, 'hex');
    const b = Buffer.from(expectedHex, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
