import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";

export async function GET() {
  if (process.env.VIBEGUARD_SYNTHETIC_MODE === "true") {
    return NextResponse.json({ error: "admin_live_auth_required" }, { status: 401 });
  }

  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase.from("profiles").select("id,display_name,role,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "query_failed" }, { status: 500 });
  return NextResponse.json({ users: data });
}
