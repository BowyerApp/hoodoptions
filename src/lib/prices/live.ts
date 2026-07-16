import { MARKETS } from "@/lib/chain/robinhood";

/**
 * Real market data via Yahoo Finance chart API (no key required).
 * SPCX is a tokenized private RWA with no public ticker, so it keeps
 * the simulated walk. Results cached for 30s per full refresh.
 */

export type LiveQuote = { price: number; changePct: number };

const CACHE_MS = 30_000;

type Cache = { at: number; quotes: Record<string, LiveQuote> };
const g = globalThis as unknown as { __livePrices?: Cache };

const LIVE_SYMBOLS = MARKETS.filter((m) => m.kind === "stock").map(
  (m) => m.symbol
);

async function fetchOne(symbol: string): Promise<LiveQuote | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        signal: ctrl.signal,
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = Number(meta?.regularMarketPrice);
    const prev = Number(meta?.chartPreviousClose ?? meta?.previousClose);
    if (!Number.isFinite(price) || price <= 0) return null;
    return {
      price,
      changePct:
        Number.isFinite(prev) && prev > 0 ? ((price - prev) / prev) * 100 : 0,
    };
  } catch {
    return null;
  }
}

export async function fetchLivePrices(): Promise<Record<string, LiveQuote>> {
  const now = Date.now();
  if (g.__livePrices && now - g.__livePrices.at < CACHE_MS) {
    return g.__livePrices.quotes;
  }

  const results = await Promise.all(LIVE_SYMBOLS.map(fetchOne));
  const quotes: Record<string, LiveQuote> = { ...g.__livePrices?.quotes };
  results.forEach((q, i) => {
    if (q) quotes[LIVE_SYMBOLS[i]] = q;
  });

  if (Object.keys(quotes).length > 0) {
    g.__livePrices = { at: now, quotes };
  }
  return quotes;
}
