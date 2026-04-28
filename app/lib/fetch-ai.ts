import { supabase } from './supabase';

export type FetchAiInput = {
  type: 'consultant' | 'juridique' | 'ocr';
  message?: string;
  imageBase64?: string;
  systemPrompt?: string;
};

export async function fetchAi(input: FetchAiInput): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch('/api/ai', {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
}

