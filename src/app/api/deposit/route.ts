import { NextRequest, NextResponse } from "next/server";
import { deposit } from "@/lib/protocol/server-store";
import { readSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const id = await readSessionId();
  if (!id) return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  const result = await deposit(id, amount);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
