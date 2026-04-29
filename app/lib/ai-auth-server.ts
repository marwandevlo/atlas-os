import type { NextRequest } from 'next/server';

type AuthOk = { ok: true; status: 200; user: { id: string } };
type AuthErrorCode = 'missing_token' | 'invalid_token' | 'server_not_configured';
type AuthErr = { ok: false; status: 401 | 500; code: AuthErrorCode };

function requireAuth(): boolean {
  const v = (process.env.ATLAS_AI_REQUIRE_AUTH ?? 'false').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Server-side auth gate for `/api/ai`.
 *
 * Default behavior is permissive (anonymous) to avoid breaking production in projects
 * where Supabase auth isn't wired to the AI route yet.
 *
 * Set `ATLAS_AI_REQUIRE_AUTH=true` to enforce presence of a bearer token.
 */
export async function authenticateAiRequest(request: NextRequest): Promise<AuthOk | AuthErr> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, status: 500, code: 'server_not_configured' };
  }

  if (!requireAuth()) {
    return { ok: true, status: 200, user: { id: 'anon' } };
  }

  const auth = request.headers.get('authorization') ?? '';
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (!token) return { ok: false, status: 401, code: 'missing_token' };

  // Minimal validation. If you want full validation, integrate Supabase auth verification here.
  if (token.length < 10) return { ok: false, status: 401, code: 'invalid_token' };

  return { ok: true, status: 200, user: { id: token.slice(0, 16) } };
}

