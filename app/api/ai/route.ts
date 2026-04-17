import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, type, imageBase64 } = await request.json();

    let systemPrompt = '';

    if (type === 'consultant') {
      systemPrompt = `Tu es un expert-comptable et conseiller fiscal marocain. Tu connais parfaitement:
- Le Code Général des Impôts du Maroc (CGI)
- La TVA marocaine (taux: 20%, 14%, 10%, 7%, exonéré)
- L'Impôt sur les Sociétés (IS): barème 10%, 20%, 26%, 31%
- L'IR sur salaires et le barème marocain
- La CNSS (part salariale 4.48%, patronale 21.26%) et AMO
- Les obligations déclaratives DGI
Réponds en français ou en darija selon la langue de l'utilisateur. Sois précis et pratique.`;
    } else if (type === 'ocr') {
      systemPrompt = `Tu es un expert en extraction de données de factures marocaines.
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
          { type: 'text', text: 'Extrais les données de cette facture en JSON.' }
        ],
      }];
    } else {
      messages = [{ role: 'user', content: message }];
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json({ error: 'Erreur API' }, { status: 500 });
  }
}