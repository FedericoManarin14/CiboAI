import { describe, it, expect } from 'vitest';
import { splitMacro } from './macros';

describe('splitMacro', () => {
  it('2000 kcal default 30/40/30', () => {
    const m = splitMacro(2000);
    expect(m.proteine_g).toBe(150); // 600 kcal / 4
    expect(m.carboidrati_g).toBe(200); // 800 kcal / 4
    expect(m.grassi_g).toBe(67); // 600 kcal / 9 arrotondato
  });

  it('rispetta un ratio personalizzato', () => {
    const m = splitMacro(2000, { p: 0.4, c: 0.3, g: 0.3 });
    expect(m.proteine_g).toBe(200); // 800 / 4
    expect(m.carboidrati_g).toBe(150); // 600 / 4
    expect(m.grassi_g).toBe(67);
  });
});
