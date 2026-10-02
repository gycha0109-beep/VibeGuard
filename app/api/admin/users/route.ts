import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // SEC-003 baseline: role is trusted from a forgeable client header.
  if (request.headers.get("x-role") !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ users: [{ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", email: "demo@example.com" }] });
}
