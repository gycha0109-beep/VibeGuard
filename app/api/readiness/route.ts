import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.VIBEGUARD_SYNTHETIC_MODE === "true") {
    return NextResponse.json(
      { status: "ready", mode: "synthetic" },
      { headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("contents")
      .select("id")
      .eq("status", "published")
      .limit(1);
    if (error) throw error;

    return NextResponse.json(
      { status: "ready", mode: "live" },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { status: "not_ready" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
