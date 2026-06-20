import { z } from 'zod';

// Schema Zod per validare l'output dell'AI (foto piatto).
// L'AI non è fidata: ogni numero è coercizzato e con default 0.

const nonNeg = z.coerce.number().min(0).default(0);

export const ingredienteAISchema = z.object({
  nome: z.string().min(1).max(120),
  grammi: z.coerce.number().min(0).max(5000).default(0),
  kcal: nonNeg,
  proteine_g: nonNeg,
  carboidrati_g: nonNeg,
  grassi_g: nonNeg,
  fibre_g: nonNeg,
  zuccheri_g: nonNeg,
  grassi_saturi_g: nonNeg,
  sodio_mg: nonNeg,
  potassio_mg: nonNeg,
  calcio_mg: nonNeg,
  ferro_mg: nonNeg,
  magnesio_mg: nonNeg,
  vit_a_ug: nonNeg,
  vit_c_mg: nonNeg,
  vit_d_ug: nonNeg,
  vit_b12_ug: nonNeg,
});

export const rispostaAISchema = z.object({
  ingredienti: z.array(ingredienteAISchema).min(1).max(30),
});

export type IngredienteAI = z.infer<typeof ingredienteAISchema>;
export type RispostaAI = z.infer<typeof rispostaAISchema>;

// JSON Schema passato a Gemini per forzare l'output strutturato.
export const geminiResponseSchema = {
  type: 'object',
  properties: {
    ingredienti: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          grammi: { type: 'number' },
          kcal: { type: 'number' },
          proteine_g: { type: 'number' },
          carboidrati_g: { type: 'number' },
          grassi_g: { type: 'number' },
          fibre_g: { type: 'number' },
          zuccheri_g: { type: 'number' },
          grassi_saturi_g: { type: 'number' },
          sodio_mg: { type: 'number' },
          potassio_mg: { type: 'number' },
          calcio_mg: { type: 'number' },
          ferro_mg: { type: 'number' },
          magnesio_mg: { type: 'number' },
          vit_a_ug: { type: 'number' },
          vit_c_mg: { type: 'number' },
          vit_d_ug: { type: 'number' },
          vit_b12_ug: { type: 'number' },
        },
        required: ['nome', 'grammi', 'kcal', 'proteine_g', 'carboidrati_g', 'grassi_g'],
      },
    },
  },
  required: ['ingredienti'],
} as const;

export const PROMPT_FOTO = `Sei un nutrizionista esperto. Analizza la foto di questo piatto/pasto.
Identifica ogni ingrediente o alimento visibile. Per ciascuno stima:
- nome (in italiano, conciso)
- grammi (porzione stimata realistica)
- valori nutrizionali PER LA PORZIONE STIMATA (non per 100g): kcal, proteine, carboidrati, grassi, fibre, zuccheri, grassi saturi, sodio, potassio, calcio, ferro, magnesio, vitamine A, C, D, B12.

Usa le unità: grammi per i macro e fibre/zuccheri/saturi; mg per sodio, potassio, calcio, ferro, magnesio, vit C; µg per vit A, D, B12.
Se un valore non è stimabile, metti 0. Stima realistica basata su porzioni tipiche.
Rispondi SOLO con il JSON richiesto, senza testo aggiuntivo.`;
