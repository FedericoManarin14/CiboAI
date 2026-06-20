import { login } from './actions';

export const metadata = { title: 'Accedi — CiboAI' };

const MESSAGGI: Record<string, string> = {
  campi: 'Inserisci email e password.',
  credenziali: 'Email o password non corretti.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const messaggio = error ? MESSAGGI[error] ?? 'Errore di accesso.' : null;

  return (
    <main className="min-h-dvh flex flex-col justify-center px-6 py-10 max-w-sm mx-auto w-full">
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192.png"
          alt="CiboAI"
          width={64}
          height={64}
          className="mx-auto mb-3 h-16 w-16 rounded-2xl border border-border"
        />
        <h1 className="text-2xl font-bold tracking-tight">CiboAI</h1>
        <p className="mt-1 text-sm text-muted">Conta le calorie dalla foto del piatto.</p>
      </div>

      <form action={login} className="card p-5 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="tu@esempio.it"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        {messaggio && (
          <p className="text-sm text-proteine font-medium" role="alert">
            {messaggio}
          </p>
        )}

        <button type="submit" className="btn-primary w-full">
          Accedi
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Registrazione chiusa. Gli account vengono creati dall&apos;amministratore.
      </p>
    </main>
  );
}
