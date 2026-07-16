import { NextResponse } from "next/server";
import { MARKETS, ROBINHOOD_CHAIN, USDG } from "@/lib/chain/robinhood";

export async function GET() {
  return NextResponse.json({
    chain: ROBINHOOD_CHAIN,
    quoteAsset: USDG,
    markets: MARKETS.map((m) => ({
      symbol: m.symbol,
      name: m.name,
      kind: m.kind,
      address: m.address,
      iv: m.iv,
      basePrice: m.basePrice,
    })),
    venue: "HoodOptions",
    description:
      "Options markets for Robinhood Chain stock tokens and RWAs. Quote asset USDG.",
  });
}
