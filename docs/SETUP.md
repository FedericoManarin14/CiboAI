# CiboAI — Setup e gestione

Guida per mettere in funzione l'app. Una volta sola.

## 1. Applica lo schema al database

Il codice è pronto, ma le tabelle vanno create sul tuo progetto Supabase
(`vixxicbtfhasyaozxuqz`). Il MCP collegato a Claude è su un altro account,
quindi questo passo è manuale (2 minuti):

1. Apri **Supabase → SQL Editor** del progetto CiboAI.
2. Copia tutto il contenuto di [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
3. Incolla nell'editor e premi **Run**.
4. Verifica: dovrebbero comparire 4 tabelle (`profiles`, `food_entries`,
   `weight_logs`, `exercise_logs`) con **RLS attiva**.

Controllo RLS (opzionale), nello stesso editor:
```sql
select tablename, rowsecurity from pg_tables where schemaname='public';
```
Tutte e 4 devono avere `rowsecurity = true`.

## 2. Crea gli account (registrazione chiusa)

Non c'è registrazione pubblica: gli account li crei tu.

1. **Supabase → Authentication → Users → Add user**.
2. Inserisci email + password e conferma (spunta "Auto Confirm User" se presente).
3. Il trigger `on_auth_user_created` crea in automatico la riga in `profiles`.
4. Ripeti per ogni amico.

### Renditi admin (opzionale)

Il ruolo `admin` non sblocca funzioni speciali nella v1 (gli account si creano
dal pannello Supabase), ma se vuoi marcarti come admin:
```sql
update profiles set ruolo = 'admin'
where id = (select id from auth.users where email = 'tua@email.it');
```

## 3. Chiave AI (Gemini) — quando vuoi attivare le foto

1. Crea una chiave su **Google AI Studio** (modello `gemini-2.5-flash`).
2. In locale: incolla in `.env.local` alla voce `GOOGLE_GENAI_API_KEY=`.
3. In produzione: aggiungila come **Environment Variable** su Vercel.

Senza chiave, tutto funziona tranne l'analisi foto (che mostra un errore
chiaro e propone l'inserimento manuale).

## 4. Variabili d'ambiente su Vercel

Imposta queste env var nel progetto Vercel (Production + Preview):

| Nome | Valore |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key |
| `GOOGLE_GENAI_API_KEY` | chiave Gemini (anche dopo) |

I valori sono gli stessi del tuo `.env.local`. Le due `NEXT_PUBLIC_*` sono
pubbliche (esposte al client, è normale); `SUPABASE_SERVICE_ROLE_KEY` e
`GOOGLE_GENAI_API_KEY` restano solo lato server.

## 5. Avvio locale

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # logica nutrizionale (BMR/TDEE/macro/totali)
npm run build    # build di produzione
```

## Note

- **Nessuna foto viene salvata**: l'immagine va a Gemini e viene scartata.
- **Costi**: solo la chiave AI (~4 foto/giorno per utente ≪ 1 €/mese). Hosting e DB sono sui piani gratuiti.
