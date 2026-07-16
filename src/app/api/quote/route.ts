import { NextRequest, NextResponse } from "next/server";
import { getMarket } from "@/lib/chain/robinhood";
import { quoteOption, type Side } from "@/lib/protocol/pricing";
import { getSnapshot } from "@/lib/protocol/server-store";
import { readSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const symbol = sp.get("symbol") || "NVDA";
  const side = (sp.get("side") || "UP").toUpperCase() as Side;
  const leverage = Number(sp.get("leverage") || 5);
  const expiryHours = Number(sp.get("expiryHours") || 24);
  const sizeUsd = Number(sp.get("sizeUsd") || 500);
  const market = getMarket(symbol);
  const sid = await readSessionId();
  let liveSpot = market.basePrice;
  if (sid) {
    try {
      const snap = await getSnapshot(sid);
      liveSpot = snap.venue.prices[symbol] ?? market.basePrice;
    } catch {
      /* use base */
    }
  }
  const spot = Number(sp.get("spot") || liveSpot);

  const quote = quoteOption({
    spot,
    leverage,
    expiryHours,
    side: side === "DOWN" ? "DOWN" : "UP",
    sizeUsd,
    iv: market.iv,
  });

  return NextResponse.json({
    symbol: market.symbol,
    spot,
    side,
    leverage,
    expiryHours,
    sizeUsd,
    quote,
    chain: "robinhood",
    collateral: "USDG",
  });
}
