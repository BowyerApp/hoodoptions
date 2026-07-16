import { NextRequest, NextResponse } from "next/server";
import { openTrade } from "@/lib/protocol/server-store";
import { readSessionId } from "@/lib/session";
import type { Side } from "@/lib/protocol/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const id = await readSessionId();
  if (!id) return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const result = await openTrade(id, {
    symbol: String(body.symbol || "NVDA"),
    side: (String(body.side || "UP").toUpperCase() === "DOWN" ? "DOWN" : "UP") as Side,
    leverage: Number(body.leverage || 5),
    expiryHours: Number(body.expiryHours || 24),
    sizeUsd: Number(body.sizeUsd || 500),
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
