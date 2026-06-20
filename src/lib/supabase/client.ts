import { createBrowserClient } from '@supabase/ssr';

/** Client Supabase per i Client Component (browser). Usa la anon key pubblica. */
export function createBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
