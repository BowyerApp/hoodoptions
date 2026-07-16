import { NextResponse } from "next/server";
import { faucet } from "@/lib/protocol/server-store";
import { readSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const id = await readSessionId();
  if (!id) return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
  const result = await faucet(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
