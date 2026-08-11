import { NextRequest, NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  isHex,
  parseUnits,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  engineAbi,
  hoodTestnetContracts,
  isTestnetLive,
  onchainMarketIds,
} from "@/lib/chain/contracts";
import { robinhoodTestnet } from "@/lib/chain/networks";
import { fetchLivePrices } from "@/lib/prices/live";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Authenticated testnet oracle publisher. Invoke from a protected external
 * scheduler once a minute during market hours. Never expose the oracle key to
 * the browser; it belongs only in the deployment environment.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.TESTNET_ORACLE_PRIVATE_KEY;
  if (!isTestnetLive || !key || !isHex(key) || key.length !== 66) {
    return NextResponse.json(
      { error: "Testnet oracle is not configured" },
      { status: 503 }
    );
  }

  const quotes = await fetchLivePrices();
  const account = privateKeyToAccount(key as Hex);
  const client = createWalletClient({
    account,
    chain: robinhoodTestnet,
    transport: http(),
  });
  const published: string[] = [];

  for (const [symbol, marketId] of Object.entries(onchainMarketIds)) {
    if (marketId === undefined) continue;
    const quote = quotes[symbol];
    if (!quote) continue;
    const price = parseUnits(quote.price.toFixed(8), 8);
    const hash = await client.writeContract({
      address: hoodTestnetContracts.engine!,
      abi: engineAbi,
      functionName: "postPrice",
      args: [marketId, price],
    });
    published.push(`${symbol}:${hash}`);
  }

  return NextResponse.json({
    ok: true,
    publisher: account.address,
    published,
    timestamp: new Date().toISOString(),
  });
}
