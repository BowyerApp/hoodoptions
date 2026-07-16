"use client";

import { MARKETS } from "@/lib/chain/robinhood";
import { formatPct, formatUsd, useForge } from "@/store/forge";

export function Ticker() {
  const prices = useForge((s) => s.venue?.prices);
  const changes = useForge((s) => s.venue?.priceChanges);
  const items = [...MARKETS, ...MARKETS];

  return (
    <div className="border-b border-border bg-bg/80 overflow-hidden">
      <div className="ticker-track flex whitespace-nowrap py-2 gap-8 w-max">
        {items.map((m, i) => {
          const ch = changes?.[m.symbol] ?? 0;
          const up = ch >= 0;
          return (
            <div
              key={`${m.symbol}-${i}`}
              className="flex items-center gap-3 px-2 text-sm"
            >
              <span className="font-mono text-muted tracking-wider text-xs">
                {m.symbol}
              </span>
              <span className="font-mono num tick-flash">
                {formatUsd(prices?.[m.symbol] ?? m.basePrice)}
              </span>
              <span className={`font-mono text-xs ${up ? "text-up" : "text-down"}`}>
                {formatPct(ch)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
