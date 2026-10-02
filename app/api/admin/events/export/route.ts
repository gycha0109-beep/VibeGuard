import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";

function csvEscape(value: unknown) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase.rpc("admin_export_events");
  if (error) return NextResponse.json({ error: "export_failed" }, { status: 500 });
  const rows = data ?? [];
  const header = ["event_name", "user_id", "session_id", "content_id", "occurred_at", "source", "version", "properties"];
  const csv = [header.join(","), ...rows.map((row: Record<string, unknown>) => header.map((key) => csvEscape(row[key])).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=vibeguard-events.csv", "cache-control": "no-store" } });
}
