/**
 * `process.env.X!` only silences TypeScript — it does nothing at runtime.
 * If these are missing, `createBrowserClient`/`createServerClient` throw a
 * cryptic "Invalid URL" deep inside the Supabase SDK. This throws once,
 * early, with a message that says exactly what to fix.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Set both in your .env.local for local dev, and in Vercel under " +
        "Project Settings → Environment Variables (for the Production " +
        "environment specifically) for deployed builds — then redeploy, " +
        "since NEXT_PUBLIC_* values are baked in at build time."
    );
  }

  return { url, anonKey };
}
