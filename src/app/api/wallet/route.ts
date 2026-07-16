import { NextResponse } from "next/server";
import { bindWallet } from "@/lib/protocol/server-store";
import { readSessionId, writeSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request" },
      { status: 400 }
    );
  }
  const current = await readSessionId();
  const result = await bindWallet(current, body.address ?? "");
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  await writeSessionId(result.userId);
  return NextResponse.json(result);
}
