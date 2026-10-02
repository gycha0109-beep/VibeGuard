import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-user";
import { eventsToCsv } from "@/lib/analytics/csv";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.supabase.rpc("admin_export_events");
  if (error) return NextResponse.json({ error: "export_failed" }, { status: 500 });
  const csv = eventsToCsv((data ?? []) as Array<Record<string, unknown>>);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=vibeguard-events.csv",
      "cache-control": "no-store"
    }
  });
}
