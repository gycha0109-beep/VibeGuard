import { createClient } from "@supabase/supabase-js";

export function createBaselineAdminClient() {
  // SEC-005 baseline: public-prefixed service role configuration is deliberately unsafe.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "synthetic-placeholder-never-a-real-secret",
    { auth: { persistSession: false } }
  );
}
