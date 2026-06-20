import {
  bmrMifflin,
  tdee,
  kcalObiettivo,
  type Sesso,
  type LivelloAttivita,
  type Obiettivo,
} from './energy';
import { splitMacro, type MacroRatio } from './macros';

export type Targets = {
  kcal_target: number;
  proteine_target_g: number;
  carbo_target_g: number;
  grassi_target_g: number;
};

/** Calcola obiettivo kcal + split macro da dati profilo. */
export function calcolaTargets(p: {
  sesso: Sesso;
  pesoKg: number;
  altezzaCm: number;
  eta: number;
  livello: LivelloAttivita;
  obiettivo: Obiettivo;
  ratio?: MacroRatio;
}): Targets {
  const bmr = bmrMifflin({
    sesso: p.sesso,
    pesoKg: p.pesoKg,
    altezzaCm: p.altezzaCm,
    eta: p.eta,
  });
  const kcal = kcalObiettivo(tdee(bmr, p.livello), p.obiettivo);
  const m = splitMacro(kcal, p.ratio);
  return {
    kcal_target: kcal,
    proteine_target_g: m.proteine_g,
    carbo_target_g: m.carboidrati_g,
    grassi_target_g: m.grassi_g,
  };
}
