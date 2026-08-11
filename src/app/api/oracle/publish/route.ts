import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  isHex,
  parseUnits,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  engineAbi,
  hoodContracts,
  isOnchainLive,
  onchainMarketIds,
} from "@/lib/chain/contracts";
import { robinhoodChain } from "@/lib/chain/networks";
import { fetchLivePrices } from "@/lib/prices/live";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Authenticated mainnet oracle publisher. Called by the scheduled GitHub
 * Actions workflow every few minutes.
 *
 * Gas + safety rules per market:
 *  - post when the price moved >= 0.2% from the on-chain spot,
 *  - or when the on-chain print is >= 30 min old during a live session
 *    (REGULAR/PRE/POST). Never refresh timestamps while the market is
 *    CLOSED — a frozen weekend price must go stale so the engine blocks
 *    new opens against it (open() requires a print < 45 min old).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.ORACLE_PRIVATE_KEY;
  if (!isOnchainLive || !key || !isHex(key) || key.length !== 66) {
    return NextResponse.json(
      { error: "Mainnet oracle is not configured" },
      { status: 503 }
    );
  }

  const quotes = await fetchLivePrices();
  const account = privateKeyToAccount(key as Hex);
  const wallet = createWalletClient({
    account,
    chain: robinhoodChain,
    transport: http(),
  });
  const reader = createPublicClient({
    chain: robinhoodChain,
    transport: http(),
  });

  const now = Math.floor(Date.now() / 1000);
  const published: string[] = [];
  const skipped: string[] = [];

  for (const [symbol, marketId] of Object.entries(onchainMarketIds)) {
    if (marketId === undefined) continue;
    const quote = quotes[symbol];
    if (!quote) {
      skipped.push(`${symbol}:no-feed`);
      continue;
    }

    const [, , spot, updatedAt] = await reader.readContract({
      address: hoodContracts.engine!,
      abi: engineAbi,
      functionName: "markets",
      args: [BigInt(marketId)],
    });

    const next = parseUnits(quote.price.toFixed(8), 8);
    const moved =
      spot === 0n
        ? true
        : (next > spot ? next - spot : spot - next) * 10_000n / spot >= 20n; // 0.2%
    const stale = now - Number(updatedAt) >= 30 * 60;
    const sessionLive = quote.marketState !== "CLOSED";

    if (!moved && !(stale && sessionLive)) {
      skipped.push(`${symbol}:fresh`);
      continue;
    }
    if (!sessionLive && spot !== 0n && !moved) {
      skipped.push(`${symbol}:closed`);
      continue;
    }

    const hash = await wallet.writeContract({
      address: hoodContracts.engine!,
      abi: engineAbi,
      functionName: "postPrice",
      args: [marketId, next],
    });
    published.push(`${symbol}:${hash}`);
  }

  return NextResponse.json({
    ok: true,
    publisher: account.address,
    published,
    skipped,
    timestamp: new Date().toISOString(),
  });
}
