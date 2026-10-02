import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { recordSyntheticEvent } from "@/lib/synthetic-store";
import { createServerSupabase } from "@/lib/supabase/server";

const allowed = new Set(["session_started","content_viewed","edit_started","edit_completed","vote_started","result_viewed","share_clicked"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  const eventName = typeof body.event_name === "string" ? body.event_name : "";
  const sessionId = typeof body.session_id === "string" ? body.session_id : "";
  const dedupeKey = typeof body.dedupe_key === "string" ? body.dedupe_key : "";
  const contentId = body.content_id == null ? null : typeof body.content_id === "string" ? body.content_id : "";
  const properties = body.properties && typeof body.properties === "object" && !Array.isArray(body.properties) ? body.properties : {};

  if (
    !allowed.has(eventName) ||
    sessionId.length < 1 || sessionId.length > 128 ||
    dedupeKey.length < 1 || dedupeKey.length > 200 ||
    (contentId !== null && !uuidPattern.test(contentId)) ||
    (eventName !== "session_started" && contentId === null) ||
    Buffer.byteLength(JSON.stringify(properties), "utf8") > 4096
  ) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  console.info(JSON.stringify({ type: "user_event_received", event_name: eventName, has_content: Boolean(contentId) }));

  if (process.env.VIBEGUARD_SYNTHETIC_MODE === "true") {
    const result = recordSyntheticEvent({
      eventName,
      sessionId,
      contentId: contentId ?? undefined,
      dedupeKey,
      occurredAt: new Date().toISOString()
    });
    return NextResponse.json({ accepted: true, duplicate: !result.inserted });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("record_event", {
    p_event_name: eventName,
    p_session_id: sessionId,
    p_content_id: contentId,
    p_properties: properties,
    p_dedupe_key: dedupeKey
  });
  if (error) return NextResponse.json({ error: "event_write_failed" }, { status: 400 });

  const result = data as { accepted?: boolean; duplicate?: boolean } | null;
  return NextResponse.json({ accepted: result?.accepted ?? true, duplicate: result?.duplicate ?? false });
}
