import { NextRequest, NextResponse } from "next/server";
import { recordSyntheticEvent } from "@/lib/synthetic-store";
import { createServerSupabase } from "@/lib/supabase/server";

const allowed = new Set(["session_started", "content_viewed", "edit_started", "edit_completed", "vote_started", "result_viewed", "share_clicked"]);

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!allowed.has(body.event_name) || typeof body.session_id !== "string" || typeof body.dedupe_key !== "string") {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  const event = {
    event_name: body.event_name,
    session_id: body.session_id,
    content_id: typeof body.content_id === "string" ? body.content_id : null,
    dedupe_key: body.dedupe_key,
    properties: typeof body.properties === "object" && body.properties ? body.properties : {},
    source: "web",
    version: 1
  };

  console.info(JSON.stringify({ type: "user_event_received", event_name: event.event_name, has_content: Boolean(event.content_id) }));

  if (process.env.VIBEGUARD_SYNTHETIC_MODE === "true") {
    const result = recordSyntheticEvent({ eventName: event.event_name, sessionId: event.session_id, contentId: event.content_id ?? undefined, dedupeKey: event.dedupe_key, occurredAt: new Date().toISOString() });
    return NextResponse.json({ accepted: true, duplicate: !result.inserted });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("user_events").insert({ ...event, user_id: user?.id ?? null });
  if (error && error.code !== "23505") return NextResponse.json({ error: "event_write_failed" }, { status: 500 });
  return NextResponse.json({ accepted: true, duplicate: error?.code === "23505" });
}
