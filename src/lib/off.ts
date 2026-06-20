// Client Open Food Facts (gratis). Barcode + ricerca per nome.
// Mappa i nutrienti per 100g sui nostri campi.
import { emptyNutrients, type Nutrients } from '@/lib/nutrition/types';

const UA = 'CiboAI/1.0 (app personale conteggio calorie)';

export type ProdottoOFF = {
  code: string;
  nome: string;
  marca?: string;
  per100g: Nutrients;
  immagine?: string;
};

type OFFProduct = {
  code?: string;
  product_name?: string;
  product_name_it?: string;
  brands?: string;
  image_small_url?: string;
  nutriments?: Record<string, number | undefined>;
};

function mappaNutrienti(n: Record<string, number | undefined> = {}): Nutrients {
  const v = emptyNutrients();
  const num = (x: number | undefined) => (typeof x === 'number' && isFinite(x) ? x : 0);
  v.kcal = num(n['energy-kcal_100g']);
  v.proteine_g = num(n['proteins_100g']);
  v.carboidrati_g = num(n['carbohydrates_100g']);
  v.grassi_g = num(n['fat_100g']);
  v.fibre_g = num(n['fiber_100g']);
  v.zuccheri_g = num(n['sugars_100g']);
  v.grassi_saturi_g = num(n['saturated-fat_100g']);
  v.sodio_mg = num(n['sodium_100g']) * 1000; // g → mg
  v.potassio_mg = num(n['potassium_100g']) * 1000;
  v.calcio_mg = num(n['calcium_100g']) * 1000;
  v.ferro_mg = num(n['iron_100g']) * 1000;
  v.magnesio_mg = num(n['magnesium_100g']) * 1000;
  v.vit_a_ug = num(n['vitamin-a_100g']) * 1_000_000; // g → µg
  v.vit_c_mg = num(n['vitamin-c_100g']) * 1000;
  v.vit_d_ug = num(n['vitamin-d_100g']) * 1_000_000;
  v.vit_b12_ug = num(n['vitamin-b12_100g']) * 1_000_000;
  return v;
}

function mappaProdotto(p: OFFProduct): ProdottoOFF | null {
  const nome = (p.product_name_it || p.product_name || '').trim();
  if (!nome) return null;
  return {
    code: p.code ?? '',
    nome,
    marca: p.brands?.split(',')[0]?.trim() || undefined,
    per100g: mappaNutrienti(p.nutriments),
    immagine: p.image_small_url,
  };
}

/** Cerca un prodotto per barcode (EAN). */
export async function cercaBarcode(barcode: string): Promise<ProdottoOFF | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,product_name_it,brands,image_small_url,nutriments`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const json = (await res.json()) as { status?: number; product?: OFFProduct };
  if (json.status !== 1 || !json.product) return null;
  return mappaProdotto(json.product);
}

/** Cerca prodotti per nome. */
export async function cercaNome(query: string, pagina = 1): Promise<ProdottoOFF[]> {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=20&page=${pagina}` +
    `&fields=code,product_name,product_name_it,brands,image_small_url,nutriments`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const json = (await res.json()) as { products?: OFFProduct[] };
  return (json.products ?? [])
    .map(mappaProdotto)
    .filter((p): p is ProdottoOFF => p !== null && p.per100g.kcal > 0);
}
