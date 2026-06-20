# 🥗 CiboAI

App personale di conteggio calorie con riconoscimento del cibo da foto.
PWA mobile-first: fotografi il piatto, l'AI riconosce ingredienti, grammi e
nutrienti e li aggiunge al diario del giorno.

## Funzioni

- 📷 **Foto → AI** (Gemini 2.5 Flash): riconoscimento ingredienti + stima nutrienti, con schermata di revisione editabile.
- 📦 **Barcode** e 🔎 **ricerca per nome** via Open Food Facts.
- ✏️ **Inserimento manuale** di alimenti.
- 📊 Diario giornaliero con 4 pasti, anello calorie, barre macro, micronutrienti.
- 🎯 Obiettivo calorico personalizzato (BMR Mifflin-St Jeor → TDEE).
- 🏃 Log attività fisica (kcal bruciate aggiunte al budget).
- ⚖️ Log peso e grafici di peso/calorie nel tempo.

## Stack

Next.js 16 (App Router, TS) · Tailwind CSS v4 · Supabase (Auth + Postgres + RLS)
· Google Gemini · Open Food Facts · Recharts · Zod · Vitest.

## Setup

Vedi [`docs/SETUP.md`](docs/SETUP.md) — schema DB, creazione account, chiave AI, deploy.

```bash
npm install
npm run dev
```

> La logica nutrizionale è in moduli puri testati: `src/lib/nutrition/`.
