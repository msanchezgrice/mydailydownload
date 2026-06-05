import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role). NEVER import from a client
 * component — uses SUPABASE_SERVICE_ROLE_KEY which must never reach the
 * browser. Used by API route handlers and server-rendered SEO hubs.
 *
 * Returns null when env is not configured so callers can degrade gracefully
 * (e.g. SEO hubs render their intro + sample fallback instead of crashing).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
