import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/protocol/server-store";
import { readSessionId, writeSessionId } from "@/lib/session";
import { getOrCreateSession } from "@/lib/protocol/server-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const existing = await readSessionId();
  if (!existing) {
    const created = await getOrCreateSession(null);
    await writeSessionId(created.userId);
    return NextResponse.json(created);
  }
  const snap = await getSnapshot(existing);
  return NextResponse.json({ userId: existing, ...snap });
}
