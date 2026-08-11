import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * OHLCV proxy over Yahoo Finance so the client never fetches cross-origin.
 * Real market candles — the chart draws exactly what the tape did.
 */

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const RANGES: Record<string, { interval: string; range: string }> = {
  "1D": { interval: "5m", range: "1d" },
  "1W": { interval: "30m", range: "5d" },
  "1M": { interval: "1d", range: "1mo" },
  "1Y": { interval: "1d", range: "1y" },
};

const CACHE_MS = 60_000;
type CacheEntry = { at: number; candles: Candle[] };
const g = globalThis as unknown as { __candles?: Map<string, CacheEntry> };
const cache = (g.__candles ??= new Map());

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") ?? "").toUpperCase();
  const rangeKey = req.nextUrl.searchParams.get("range") ?? "1D";
  if (!/^[A-Z.]{1,8}$/.test(symbol) || !RANGES[rangeKey]) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }

  const key = `${symbol}:${rangeKey}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return NextResponse.json({ symbol, range: rangeKey, candles: hit.candles });
  }

  const { interval, range } = RANGES[rangeKey];
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
      {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) throw new Error(`yahoo ${res.status}`);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const ts: number[] = result?.timestamp ?? [];
    const q = result?.indicators?.quote?.[0] ?? {};
    const candles: Candle[] = [];
    for (let i = 0; i < ts.length; i++) {
      const open = q.open?.[i];
      const high = q.high?.[i];
      const low = q.low?.[i];
      const close = q.close?.[i];
      if ([open, high, low, close].some((v) => typeof v !== "number")) continue;
      candles.push({
        time: ts[i],
        open,
        high,
        low,
        close,
        volume: typeof q.volume?.[i] === "number" ? q.volume[i] : 0,
      });
    }
    if (candles.length > 0) cache.set(key, { at: Date.now(), candles });
    return NextResponse.json({ symbol, range: rangeKey, candles });
  } catch {
    // Serve the stale cache rather than an empty chart if Yahoo hiccups.
    if (hit) {
      return NextResponse.json({
        symbol,
        range: rangeKey,
        candles: hit.candles,
        stale: true,
      });
    }
    return NextResponse.json({ error: "feed unavailable" }, { status: 502 });
  }
}
