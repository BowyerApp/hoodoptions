import { NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/protocol/server-store";
import { readSessionId, writeSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const existing = await readSessionId();
  const result = await getOrCreateSession(existing);
  await writeSessionId(result.userId);
  return NextResponse.json(result);
}

export async function GET() {
  const existing = await readSessionId();
  const result = await getOrCreateSession(existing);
  await writeSessionId(result.userId);
  return NextResponse.json(result);
}
