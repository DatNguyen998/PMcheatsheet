/**
 * Read-only Supabase client for the running app. Uses the public anon key —
 * safe to expose because Row Level Security (see
 * supabase/migrations/0001_init.sql) only grants that key SELECT access.
 * Writes never happen from the app; see docs/database-schema.md.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let attempted = false;
let warned = false;

/**
 * Returns a shared Supabase client, or null if the app hasn't been
 * configured yet (missing env vars). Callers should treat `null` as "no
 * content available" rather than throwing, so the app still renders (with an
 * empty/setup-needed state) before Supabase is wired up.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (attempted) return client;
  attempted = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (!warned) {
      warned = true;
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.\n" +
          "Copy .env.example to .env.local and fill in your Supabase project's values (see docs/database-schema.md).\n" +
          "Rendering with empty content until then."
      );
    }
    return null;
  }

  client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}
