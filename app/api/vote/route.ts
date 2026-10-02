import { NextRequest, NextResponse } from "next/server";

const baselineVotes: Array<{ pollId: string; userId: string; option: string; at: number }> = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.pollId || !body.userId || !body.option) return NextResponse.json({ error: "invalid" }, { status: 400 });
  // INT-001/002 baseline: no idempotency key, no DB unique invariant, no transaction.
  baselineVotes.push({ pollId: body.pollId, userId: body.userId, option: body.option, at: Date.now() });
  return NextResponse.json({ accepted: true, totalForProcessLifetime: baselineVotes.length });
}
