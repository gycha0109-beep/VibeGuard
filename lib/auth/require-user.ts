import { createServerSupabase } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { ok: false as const, status: 401, error: "unauthorized" };
  return { ok: true as const, supabase, user: data.user };
}

export async function requireAdmin() {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (error || data?.role !== "admin") return { ok: false as const, status: 403, error: "forbidden" };
  return auth;
}
