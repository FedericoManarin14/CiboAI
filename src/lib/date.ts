// Utility per le date del diario. Le date sono stringhe "YYYY-MM-DD" (giorno
// calendario, fuso Europe/Rome) per evitare ambiguità di timezone.

const TZ = 'Europe/Rome';

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Data di oggi (YYYY-MM-DD) nel fuso Europe/Rome. */
export function oggiISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

/** Aggiunge (o sottrae) giorni a una data ISO. */
export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

export function isOggi(iso: string): boolean {
  return iso === oggiISO();
}

export function isFuturo(iso: string): boolean {
  return iso > oggiISO();
}

/** Etichetta breve: "Oggi", "Ieri", "Domani" o "lun 16 giu". */
export function etichettaGiorno(iso: string): string {
  const oggi = oggiISO();
  if (iso === oggi) return 'Oggi';
  if (iso === addDays(oggi, -1)) return 'Ieri';
  if (iso === addDays(oggi, 1)) return 'Domani';
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parseISO(iso));
}

/** Etichetta lunga: "lunedì 16 giugno 2026". */
export function etichettaGiornoLunga(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseISO(iso));
}

/** Valida una stringa data; se non valida ritorna oggi. */
export function dataValidaOggi(iso?: string | null): string {
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return oggiISO();
}
