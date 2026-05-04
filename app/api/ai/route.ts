import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateAiRequest } from '@/app/lib/ai-auth-server';
import { checkAiRateLimit } from '@/app/lib/ai-rate-limit';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CONSULTANT_SYSTEM = `Tu es un expert-comptable et conseiller fiscal marocain. Tu connais parfaitement:
- Le Code Général des Impôts du Maroc (CGI)
- La TVA marocaine (taux: 20%, 14%, 10%, 7%, exonéré)
- L'Impôt sur les Sociétés (IS): barème 10%, 20%, 26%, 31%
- L'IR sur salaires et le barème marocain
- La CNSS (part salariale 4.48%, patronale 21.26%) et AMO
- Les obligations déclaratives DGI
Réponds en français ou en darija selon la langue de l'utilisateur. Sois précis et pratique.
Rappelle que tes réponses sont informatives et ne remplacent pas un conseil juridique ou une mission d'expert-comptable agréé.`;

const JURIDIQUE_SYSTEM = `Tu es un expert juridique marocain spécialisé en droit des sociétés, formalités RC et textes d'actes.
Tu rédiges des documents professionnels en français, conformes aux usages marocains.
Rappelle que l'utilisateur doit faire valider tout acte par un professionnel habilité.`;

const OCR_SYSTEM = `Tu es un expert en extraction de données de factures marocaines.
Extrais les informations en JSON avec ces champs exactement:
{
  "numero_facture": "...",
  "date": "...",
  "fournisseur": "...",
  "montant_ht": 0,
  "taux_tva": 20,
  "montant_tva": 0,
  "montant_ttc": 0,
  "description": "..."
}
Réponds UNIQUEMENT avec le JSON valide, sans texte supplémentaire.`;

const ASSISTANT_SYSTEM = `Tu es l'assistant ZAFIRIX PRO (SaaS comptabilité/fiscalité/RH/juridique Maroc).
Tu dois répondre en **JSON strict** au format:
{
  "response": "texte utilisateur (court, professionnel)",
  "actions": [
    {
      "action": "create_invoice" | "add_payment" | "create_client" | "search" | "link_entity",
      "data": { ... },
      "confidence": 0.0,
      "requiresConfirmation": true
    }
  ]
}

Règles:
- Réponds uniquement avec du JSON valide (pas de markdown, pas de texte hors JSON).
- Si aucune action n'est nécessaire, renvoie actions: [].
- Les actions doivent être prudentes: requiresConfirmation doit être true.
- Les montants sont en MAD, dates en YYYY-MM-DD.`;

function tryParseAssistantJson(text: string): { response: string; actions: unknown[] } | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    const response = obj.response;
    const actions = obj.actions;
    if (typeof response !== 'string') return null;
    if (!Array.isArray(actions)) return null;
    return { response, actions };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAiRequest(request);
  if (!auth.ok) {
    const msg =
      auth.code === 'missing_token'
        ? 'Authentification requise. Connectez-vous et réessayez.'
        : auth.code === 'invalid_token'
          ? 'Session invalide ou expirée. Reconnectez-vous.'
          : 'Configuration serveur incomplète.';
    return NextResponse.json({ error: msg }, { status: auth.status });
  }

  const rate = checkAiRateLimit(`ai:${auth.user.id}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Limite de requêtes atteinte. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
    );
  }

  try {
    const body = await request.json() as {
      message?: string;
      type?: string;
      imageBase64?: string;
      systemPrompt?: string;
    };

    const { message, type, imageBase64, systemPrompt: systemOverride } = body;

    let systemPrompt = '';

    if (type === 'consultant') {
      systemPrompt = CONSULTANT_SYSTEM;
    } else if (type === 'juridique') {
      systemPrompt = JURIDIQUE_SYSTEM;
    } else if (type === 'ocr') {
      systemPrompt = OCR_SYSTEM;
    } else if (type === 'assistant') {
      systemPrompt = ASSISTANT_SYSTEM;
    } else {
      return NextResponse.json({ error: 'Type de requête non supporté' }, { status: 400 });
    }

    if (typeof systemOverride === 'string' && systemOverride.trim() && type === 'consultant') {
      systemPrompt = systemOverride.trim();
    }

    let messages: Anthropic.MessageParam[];

    if (type === 'ocr' && imageBase64) {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64,
            },
          },
          { type: 'text', text: 'Extrais les données de cette facture en JSON.' },
        ],
      }];
    } else {
      if (typeof message !== 'string' || !message.trim()) {
        return NextResponse.json({ error: 'Message requis' }, { status: 400 });
      }
      messages = [{ role: 'user', content: message }];
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    if (type === 'assistant') {
      const parsed = tryParseAssistantJson(text);
      if (parsed) return NextResponse.json(parsed);
      return NextResponse.json({ response: text, actions: [] });
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json({ error: 'Erreur API' }, { status: 500 });
  }
}
