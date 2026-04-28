import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

type AuthOk = { ok: true; user: { id: string } };
type AuthErr = {
  ok: false;
  status: 401 | 500;
  code: 'missing_token' | 'invalid_token' | 'config_missing';
};

export type AiAuthResult = AuthOk | AuthErr;

export async function authenticateAiRequest(request: NextRequest): Promise<AiAuthResult> {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return { ok: false, status: 401, code: 'missing_token' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, status: 500, code: 'config_missing' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user?.id) {
    return { ok: false, status: 401, code: 'invalid_token' };
  }

  return { ok: true, user: { id: data.user.id } };
}

