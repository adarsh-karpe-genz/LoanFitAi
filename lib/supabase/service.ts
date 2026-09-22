import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * ONLY used server-side (API routes, server actions, Edge Functions).
 * NEVER import this in any client component or expose to the browser.
 *
 * The SUPABASE_SERVICE_ROLE_KEY env var must NOT have the NEXT_PUBLIC_ prefix
 * so Next.js never includes it in the client bundle.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not set. ' +
      'Add it to .env.local (server-only, no NEXT_PUBLIC_ prefix for the service key).'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
