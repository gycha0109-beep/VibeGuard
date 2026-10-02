import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const event = await request.json();
  // OBS-001 baseline: unstructured logging may include user-provided PII.
  console.log("event", event);
  return NextResponse.json({ accepted: true });
}
