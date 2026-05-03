export type SendEmailResult = { ok: true; id?: string } | { ok: false; skipped: true; reason: string } | { ok: false; error: string };

function resolveResendApiKey(): string {
  return (process.env.EMAIL_API_KEY ?? process.env.RESEND_API_KEY ?? '').trim();
}

/**
 * Sends via [Resend](https://resend.com) when `EMAIL_API_KEY` or `RESEND_API_KEY` is set.
 * Otherwise skips (no throw) so builds and local dev keep working.
 */
export async function sendEmailViaResend(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  const apiKey = resolveResendApiKey();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'ZAFIRIX PRO <onboarding@resend.dev>';

  if (!apiKey) {
    return { ok: false, skipped: true, reason: 'EMAIL_API_KEY or RESEND_API_KEY not configured' };
  }

  const to = params.to.trim();
  if (!to) return { ok: false, error: 'missing_recipient' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: params.subject,
        html: params.html,
        text: params.text ?? stripHtml(params.html),
      }),
    });

    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: typeof json?.message === 'string' ? json.message : `http_${res.status}` };
    }
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network_error' };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
