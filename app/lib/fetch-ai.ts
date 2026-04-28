type FetchAiArgs = {
  type: 'consultant' | 'juridique' | 'ocr';
  message?: string;
  imageBase64?: string;
  systemPrompt?: string;
};

export async function fetchAi(args: FetchAiArgs): Promise<Response> {
  return fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
}

