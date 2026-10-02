import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "vibeguard" },
    { headers: { "cache-control": "no-store" } }
  );
}
