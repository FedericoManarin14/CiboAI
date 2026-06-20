# PRD — CiboAI

**Documento dei requisiti di prodotto.** Versione 1.0 · 2026-06-20

App personale di conteggio calorie con riconoscimento del cibo da foto tramite AI. Clone funzionale di Cal AI, ispirato anche a Yazio. Web app mobile-first (PWA), uso personale + pochi amici invitati.

---

## 1. Obiettivo e contesto

L'utente vuole sostituire Cal AI (~10 €/mese) con un'app propria che:

- Conta le calorie giorno per giorno, divise in **colazione, pranzo, cena, spuntini**.
- Mostra **macro e micronutrienti** per ogni cibo e per il totale del giorno.
- Permette di **fotografare il piatto**: l'AI riconosce automaticamente gli ingredienti, ne stima i pesi e i nutrienti, e li aggiunge al pasto.
- Usa una **chiave AI dell'utente** col costo minore possibile, restando funzionale.
- Costo totale **< 10 €/mese** (target Cal AI).
- Usabile soprattutto **da telefono via link**.

### Metrica di successo
- Costo mensile reale < 10 € con uso quotidiano da parte dell'utente + alcuni amici.
- Una foto di un piatto produce una stima nutrizionale ragionevole e modificabile in < 15 secondi.
- L'utente smette di usare Cal AI.

---

## 2. Utenti

- **Admin** (proprietario): può creare account per amici. Registrazione pubblica chiusa.
- **Utente standard**: amico invitato. Vede e gestisce solo i propri dati.

Autenticazione: email + password (Supabase Auth). RLS garantisce isolamento dati.

---

## 3. Vincoli

| Vincolo | Valore |
|---------|--------|
| Budget infrastruttura | Solo piani gratuiti (Vercel Hobby + Supabase Free) |
| Costo variabile | Solo chiave AI, < 10 €/mese totali |
| Piattaforma | Web app PWA, mobile-first, accesso via link |
| Lingua / unità | Italiano · grammi, kg, kcal |
| Storage foto | Nessuno (foto analizzata e scartata) |

---

## 4. Stack tecnico

- **Next.js** (App Router, TypeScript) come PWA installabile.
- **Vercel** per hosting (free).
- **Supabase** (free): Auth + Postgres + Row Level Security.
- **Google Gemini 2.5 Flash** per l'analisi delle foto (vision, JSON strutturato, costo minimo). Chiave da Google AI Studio, lato server.
- **Open Food Facts** API per barcode e ricerca prodotti confezionati.
- **Tailwind CSS** per la UI minimal. **Zod** per validare l'output AI. **Recharts** (o simile) per i grafici.

### Stima costi AI
~4 analisi foto/giorno per utente ≈ 120/mese. Con Gemini 2.5 Flash il costo per immagine è minimo → ben sotto 1 €/mese per utente, sotto 10 €/mese anche con più amici. Margine ampio.

---

## 5. Funzionalità (scope v1)

### 5.1 Onboarding e profilo
- Inserimento: sesso, età, altezza, peso, obiettivo (dimagrire / mantenere / aumentare), livello di attività.
- Calcolo automatico **BMR (Mifflin-St Jeor) → TDEE → obiettivo kcal giornaliero** e split macro.
- Profilo modificabile.

### 5.2 Diario giornaliero
- Vista del giorno con 4 sezioni: colazione, pranzo, cena, spuntini.
- Per ogni sezione: lista alimenti con grammi e kcal.
- In alto: anello di progresso kcal (consumate vs obiettivo) + barre macro (proteine/carbo/grassi).
- Dettaglio micronutrienti del giorno espandibile.
- Navigazione tra i giorni.

### 5.3 Aggiunta cibo — 4 modalità
1. **Foto (principale)**: scatta/scegli foto → AI → schermata di revisione con ingredienti, grammi e nutrienti → modifica → salva nel pasto scelto.
2. **Barcode**: scansione codice a barre → dati da Open Food Facts → quantità → salva.
3. **Ricerca per nome**: cerca su Open Food Facts + cibi comuni → scegli → quantità → salva.
4. **Manuale**: inserimento libero di nome, grammi e nutrienti.

Tutte le modalità producono una `food_entry` modificabile prima del salvataggio.

### 5.4 Modifica e cancellazione
- Ogni alimento loggato è modificabile (grammi, nutrienti) o eliminabile.
- Spostabile tra i pasti.

### 5.5 Storico e progressi
- **Calendario / storico**: navigare ai giorni passati e vederne il riepilogo.
- **Grafici**: andamento del peso e delle kcal nel tempo.
- **Log peso**: l'utente registra il proprio peso (per i grafici e l'aggiornamento del fabbisogno).

### 5.6 Attività fisica
- Log allenamenti con kcal bruciate (manuale o da elenco attività comuni).
- Le kcal bruciate aumentano il budget del giorno.

### 5.7 Amministrazione
- L'admin crea account per amici.
- Registrazione pubblica disabilitata.

---

## 6. Riconoscimento foto — specifica del flusso

1. Utente seleziona il pasto e scatta/carica la foto.
2. API route server-side invia l'immagine a Gemini 2.5 Flash con un **prompt strutturato** che richiede JSON:
   ```json
   {
     "ingredienti": [
       {
         "nome": "string",
         "grammi": 0,
         "kcal": 0,
         "proteine_g": 0, "carboidrati_g": 0, "grassi_g": 0,
         "fibre_g": 0, "zuccheri_g": 0, "grassi_saturi_g": 0,
         "sodio_mg": 0, "potassio_mg": 0, "calcio_mg": 0,
         "ferro_mg": 0, "magnesio_mg": 0,
         "vit_a_ug": 0, "vit_c_mg": 0, "vit_d_ug": 0, "vit_b12_ug": 0
       }
     ]
   }
   ```
3. Backend **valida con Zod**. Se il JSON è malformato → 1 retry → poi fallback a inserimento manuale con messaggio chiaro.
4. Schermata di **revisione**: l'utente corregge grammi, rimuove o aggiunge ingredienti. I totali si ricalcolano in tempo reale.
5. Conferma → salvataggio su Supabase nel pasto/giorno scelti.
6. La foto viene scartata (nessuno storage).

---

## 7. Modello dati

### `profiles` (1:1 con `auth.users`)
`id, sesso, eta, altezza_cm, peso_kg, obiettivo, livello_attivita, kcal_target, proteine_target_g, carbo_target_g, grassi_target_g, ruolo (admin|user), created_at`

### `food_entries`
`id, user_id, data (date), tipo_pasto (colazione|pranzo|cena|spuntino), nome, grammi, kcal, proteine_g, carboidrati_g, grassi_g, fibre_g, zuccheri_g, grassi_saturi_g, sodio_mg, potassio_mg, calcio_mg, ferro_mg, magnesio_mg, vit_a_ug, vit_c_mg, vit_d_ug, vit_b12_ug, fonte (foto|barcode|ricerca|manuale), created_at`

### `weight_logs`
`id, user_id, data, peso_kg, created_at`

### `exercise_logs`
`id, user_id, data, attivita, kcal_bruciate, created_at`

**RLS** attiva su tutte: l'utente accede solo alle righe con il proprio `user_id`.

---

## 8. Calcoli nutrizionali

- **BMR (Mifflin-St Jeor)**
  - Uomo: `10·peso + 6.25·altezza − 5·età + 5`
  - Donna: `10·peso + 6.25·altezza − 5·età − 161`
- **TDEE** = BMR × moltiplicatore attività (sedentario 1.2 → molto attivo 1.9).
- **Obiettivo kcal** = TDEE + offset (es. −500 dimagrire, 0 mantenere, +300/+500 aumentare).
- **Split macro** default (es. 30% proteine / 40% carbo / 30% grassi), configurabile.
- Budget del giorno = obiettivo kcal + kcal da `exercise_logs` del giorno.

Tutta questa logica va in moduli puri e **testati (TDD)**.

---

## 9. UI / UX

- Stile **pulito e minimal** (bianco, molto spazio, anelli di progresso tipo Cal AI).
- **Mobile-first**: pulsante fotocamera prominente, navigazione a tab in basso (Diario · Storico · Aggiungi · Profilo).
- Feedback chiaro durante l'analisi AI (loader) e in caso di errore.
- Installabile come PWA (manifest + icone).

---

## 10. Sicurezza

- Chiave AI e service key solo lato server (env var su Vercel). Mai nel bundle client.
- RLS su Supabase per isolamento dati.
- Validazione di ogni input utente e di ogni output AI.

---

## 11. Fuori scope (v1)

App nativa store · storage foto · social/condivisione · gamification · pagamenti in-app · integrazioni wearable · ricette/piani pasto generati.

---

## 12. Ordine di sviluppo consigliato

1. **Setup**: Next.js + Tailwind + PWA, progetto Supabase, schema + RLS, deploy iniziale su Vercel.
2. **Auth** + creazione account admin/amici.
3. **Onboarding/profilo** + calcoli BMR/TDEE (con test).
4. **Diario giornaliero** + aggiunta/modifica manuale di `food_entries` + totali.
5. **Flusso foto AI** (Gemini) con schermata di revisione — il cuore dell'app.
6. **Barcode + ricerca** via Open Food Facts.
7. **Storico, calendario, grafici** + log peso.
8. **Log attività** e integrazione nel budget.
9. Rifinitura UI minimal, PWA, gestione errori.

Ogni blocco: design → piano → implementazione → verifica.

---

## 13. Domande aperte / decisioni future

- Soglia/avviso se la chiave AI si avvicina a un limite di costo (monitoraggio uso).
- Eventuale incrocio dei valori AI con un DB nutrizionale per maggiore precisione (post-v1).
- Backup/export dei dati dell'utente.
