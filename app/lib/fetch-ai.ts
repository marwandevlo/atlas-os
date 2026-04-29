type FetchAiArgs = {
  type: 'consultant' | 'juridique' | 'ocr';
  message?: string;
  imageBase64?: string;
  systemPrompt?: string;
};

/**
 * Thin client wrapper around `/api/ai`.
 * Keeps auth transport flexible (cookies by default), so production can enforce auth later
 * without changing UI callsites.
 */
export function fetchAi(args: FetchAiArgs): Promise<Response> {
  return fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(args),
  });
}

