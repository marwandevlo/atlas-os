import type { NextRequest } from 'next/server';

type AuthOk = { ok: true; status: 200; user: { id: string } };
type AuthErr = {
  ok: false;
  status: 401 | 500;
  code: 'missing_token' | 'invalid_token' | 'server_config';
};

/**
 * Minimal server auth wrapper for AI endpoints.
 *
 * Note: This codebase currently doesn't wire Supabase SSR cookies here.
 * For now we allow the request if the server has an AI key configured.
 */
export async function authenticateAiRequest(_request: NextRequest): Promise<AuthOk | AuthErr> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, status: 500, code: 'server_config' };
  }

  return { ok: true, status: 200, user: { id: 'local' } };
}

