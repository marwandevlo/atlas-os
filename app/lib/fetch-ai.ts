'use client';

import { supabase } from './supabase';

/**
 * Calls /api/ai with the current Supabase session (Bearer access_token).
 * All AI features require an authenticated user.
 */
export async function fetchAi(body: Record<string, unknown>): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return fetch('/api/ai', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
