import { describe, it, expect } from 'vitest';
import { calcolaTargets } from './profile';

describe('calcolaTargets', () => {
  it('uomo 80/180/30 moderato mantenere', () => {
    const t = calcolaTargets({
      sesso: 'uomo',
      pesoKg: 80,
      altezzaCm: 180,
      eta: 30,
      livello: 'moderato',
      obiettivo: 'mantenere',
    });
    expect(t.kcal_target).toBe(2759); // round(1780*1.55)
    expect(t.proteine_target_g).toBe(207);
    expect(t.carbo_target_g).toBe(276);
    expect(t.grassi_target_g).toBe(92);
  });

  it('dimagrire sottrae 500 kcal al TDEE', () => {
    const t = calcolaTargets({
      sesso: 'uomo',
      pesoKg: 80,
      altezzaCm: 180,
      eta: 30,
      livello: 'moderato',
      obiettivo: 'dimagrire',
    });
    expect(t.kcal_target).toBe(2259);
  });
});
