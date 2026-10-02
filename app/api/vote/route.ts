import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { submitSyntheticVote } from "@/lib/synthetic-store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body.pollId !== "string" || typeof body.option !== "string" || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (process.env.VIBEGUARD_SYNTHETIC_MODE === "true") {
    const result = submitSyntheticVote(body.pollId, body.option);
    return NextResponse.json({ accepted: true, duplicate: !result.inserted, count: result.count });
  }

  const auth = await requireUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase.rpc("submit_vote", {
    p_poll: body.pollId,
    p_option: body.option,
    p_dedupe_key: request.headers.get("idempotency-key") ?? crypto.randomUUID(),
    p_session_id: body.sessionId
  });
  if (error) return NextResponse.json({ error: "vote_failed" }, { status: 409 });
  return NextResponse.json(data);
}
