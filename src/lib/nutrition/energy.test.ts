import { describe, it, expect } from 'vitest';
import { bmrMifflin, tdee, kcalObiettivo } from './energy';

describe('bmrMifflin', () => {
  it('uomo 80kg/180cm/30 = 1780', () => {
    expect(bmrMifflin({ sesso: 'uomo', pesoKg: 80, altezzaCm: 180, eta: 30 })).toBe(1780);
  });
  it('donna 60kg/165cm/30 = 1320.25', () => {
    expect(bmrMifflin({ sesso: 'donna', pesoKg: 60, altezzaCm: 165, eta: 30 })).toBeCloseTo(1320.25, 2);
  });
});

describe('tdee', () => {
  it('sedentario = bmr*1.2', () => {
    expect(tdee(1780, 'sedentario')).toBeCloseTo(2136, 0);
  });
  it('moderato = bmr*1.55', () => {
    expect(tdee(1780, 'moderato')).toBeCloseTo(2759, 0);
  });
});

describe('kcalObiettivo', () => {
  it('dimagrire sottrae 500', () => {
    expect(kcalObiettivo(2000, 'dimagrire')).toBe(1500);
  });
  it('mantenere invariato', () => {
    expect(kcalObiettivo(2000, 'mantenere')).toBe(2000);
  });
  it('aumentare aggiunge 400', () => {
    expect(kcalObiettivo(2000, 'aumentare')).toBe(2400);
  });
});
