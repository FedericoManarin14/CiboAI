# CiboAI — Istruzioni di sviluppo (CLAUDE.md)

App personale di conteggio calorie con riconoscimento del cibo da foto. Clone funzionale di Cal AI / Yazio, web app mobile-first usabile da link. Questo file dice a Claude COME costruirla. Il **cosa** completo è nel `PRD.md` — leggilo prima di iniziare.

## Obiettivo in una riga

Web app (PWA) dove l'utente fotografa un piatto e l'AI identifica gli ingredienti, ne stima i grammi e i nutrienti (macro + micro), aggiungendoli automaticamente al pasto del giorno. Più diario giornaliero, obiettivi calorici personalizzati, storico e grafici.

## Vincolo economico (NON negoziabile)

Costo totale di esercizio **< 10 €/mese**. Quindi:

- **Solo piani gratuiti** per hosting e database: Vercel (Hobby) + Supabase (Free).
- L'unico costo è la **chiave AI**, pagata dall'utente. Va tenuta minima.
- Modello AI: **Google Gemini 2.5 Flash** (vision multimodale, il più economico tra gli affidabili). Una sola chiamata per foto, output JSON strutturato.
- Niente storage di immagini (le foto si analizzano e si buttano) per non consumare storage e ridurre costi.
- Cache e prudenza nelle chiamate AI: niente chiamate ridondanti.

## Stack tecnologico

| Area | Scelta | Note |
|------|--------|------|
| Framework | **Next.js (App Router, TypeScript)** | PWA installabile, mobile-first |
| Hosting | **Vercel** (Hobby/free) | Fluid Compute, Node.js runtime |
| Auth + DB | **Supabase** (Free) | Postgres + Auth email/password + Row Level Security |
| AI vision | **Google Gemini 2.5 Flash** via `@google/genai` | Chiave da Google AI Studio. Usa AI Gateway di Vercel se comodo, altrimenti SDK diretto |
| Dati nutrizionali esterni | **Open Food Facts** API (gratis) | Barcode + ricerca per nome prodotti confezionati |
| UI | Tailwind CSS + componenti minimal | Stile pulito, bianco, anelli di progresso |
| Validazione | Zod | Valida l'output JSON dell'AI prima di salvare |
| Grafici | Libreria leggera (es. Recharts) | Peso e kcal nel tempo |

> Prima di usare qualsiasi libreria/SDK (Next.js, Supabase, `@google/genai`, Tailwind, Recharts), **consulta Context7 MCP** per la sintassi e la config aggiornate. Non fidarti della memoria.

## Principi di sviluppo

- **TDD dove ha senso**: logica nutrizionale (calcolo BMR/TDEE, somma nutrienti, conversioni grammi) va testata. Test prima del codice.
- **Unità piccole e isolate**: ogni file una responsabilità chiara. Logica calorica separata dalla UI e dalle chiamate AI.
- **L'output dell'AI non è fidato**: valida sempre con Zod. Gestisci il caso in cui l'AI sbaglia o restituisce JSON malformato (retry una volta, poi fallback a inserimento manuale).
- **Tutto modificabile**: dopo il riconoscimento foto, l'utente deve poter correggere grammi, rimuovere/aggiungere ingredienti prima di salvare.
- **Mobile-first sempre**: progetta per il telefono, poi adatta al desktop. Tocco facile, fotocamera accessibile in un tap.
- **Sicurezza dati**: Row Level Security su Supabase — ogni utente vede solo i propri dati. La chiave AI sta SOLO lato server (env var), mai esposta al client.
- **Italiano** in tutta la UI. Unità: grammi/kg, kcal.

## Modello dati (Supabase / Postgres)

- `profiles` — collegato a `auth.users`: sesso, età, altezza, peso, obiettivo, livello attività, kcal target, macro target, ruolo (admin/user).
- `food_entries` — un alimento loggato: user_id, data, tipo_pasto (colazione/pranzo/cena/spuntino), nome, grammi, kcal, proteine, carbo, grassi + micronutrienti, fonte (foto/barcode/ricerca/manuale).
- `weight_logs` — user_id, data, peso.
- `exercise_logs` — user_id, data, attività, kcal bruciate.

RLS attiva su tutte le tabelle. Admin (tu) può creare account per amici; registrazione pubblica chiusa.

## Flusso foto (cuore dell'app)

1. Utente scatta/sceglie foto dal pasto.
2. Foto inviata a una API route server-side → Gemini 2.5 Flash con prompt strutturato.
3. AI restituisce JSON: lista ingredienti, grammi stimati, nutrienti per ingrediente.
4. Backend valida con Zod, somma i totali.
5. Schermata di revisione: utente corregge → conferma → salva su Supabase.
6. Foto scartata.

## Micronutrienti da tracciare

Macro: kcal, proteine, carboidrati, grassi.
Micro: fibre, zuccheri, grassi saturi, sodio, potassio, calcio, ferro, magnesio, vitamine A, C, D, B12.

## Calcolo fabbisogno

- BMR con **Mifflin-St Jeor**, × moltiplicatore livello attività = **TDEE**.
- Obiettivo kcal = TDEE ± offset secondo obiettivo (dimagrire −, mantenere 0, aumentare +).
- Split macro di default sensato (es. 30/40/30) configurabile.
- `exercise_logs` aggiunge kcal al budget del giorno.

## Cosa NON fare (YAGNI)

- Niente app store nativa (è una PWA).
- Niente storage delle foto.
- Niente social, condivisione, gamification complessa.
- Niente pagamenti in-app (la chiave la mette l'utente).
- Niente integrazioni wearable nella v1.

## Definizione di "fatto" per la v1

Leggi `PRD.md` per lo scope completo e l'ordine di sviluppo consigliato.
