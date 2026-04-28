import { createClient, type User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export type AiAuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401; code: 'missing_token' | 'invalid_token' | 'misconfigured' };

/**
 * Validates Supabase JWT from Authorization: Bearer <access_token>.
 * Works with the browser client that stores the session in localStorage:
 * callers must forward the access token in the Authorization header.
 */
export async function authenticateAiRequest(request: NextRequest): Promise<AiAuthResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { ok: false, status: 401, code: 'misconfigured' };
  }

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return { ok: false, status: 401, code: 'missing_token' };
  }

  const supabase = createClient(url, anonKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { ok: false, status: 401, code: 'invalid_token' };
  }

  return { ok: true, user };
}
