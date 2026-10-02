import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_example"
  );
}
