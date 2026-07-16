import { NextRequest, NextResponse } from "next/server";
import { claim } from "@/lib/protocol/server-store";
import { readSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const id = await readSessionId();
  if (!id) return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const result = await claim(id, String(body.positionId || ""));
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
