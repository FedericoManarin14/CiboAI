import { GoogleGenAI } from '@google/genai';
import { rispostaAISchema, geminiResponseSchema, PROMPT_FOTO, type RispostaAI } from './ai-schema';

const MODEL = 'gemini-2.5-flash';

export class GeminiError extends Error {}

/**
 * Analizza la foto di un piatto con Gemini 2.5 Flash.
 * Output JSON validato con Zod. Un retry in caso di JSON malformato.
 * L'immagine non viene salvata da nessuna parte.
 */
export async function analizzaFoto(base64: string, mimeType: string): Promise<RispostaAI> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new GeminiError('Chiave AI non configurata.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const chiama = async (): Promise<RispostaAI> => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64 } },
            { text: PROMPT_FOTO },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: geminiResponseSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new GeminiError('Risposta AI vuota.');

    const parsed = rispostaAISchema.safeParse(JSON.parse(text));
    if (!parsed.success) throw new GeminiError('JSON AI non valido.');
    return parsed.data;
  };

  try {
    return await chiama();
  } catch {
    // Retry una volta: l'AI a volte sbaglia il formato.
    return await chiama();
  }
}
