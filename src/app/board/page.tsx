"use client";

import { useRouter } from "next/navigation";
import { MARKETS } from "@/lib/chain/robinhood";
import { EXPIRIES, LEVERAGES, quoteOption } from "@/lib/protocol/pricing";
import { formatUsd, useForge } from "@/store/forge";

export default function BoardPage() {
  const router = useRouter();
  const prices = useForge((s) => s.venue?.prices);
  const symbol = "NVDA";
  const market = MARKETS.find((m) => m.symbol === symbol)!;
  const spot = prices?.[symbol] ?? market.basePrice;

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        CHAIN BOARD
      </div>
      <h1 className="text-4xl mb-2">Strike × expiry</h1>
      <p className="text-muted mb-8 max-w-xl">
        Deribit-style matrix for {symbol} on Robinhood Chain. Click a cell to
        open the ticket with leverage band mapped to strike distance.
      </p>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-mono text-muted">
              <th className="px-4 py-3 text-left">Lev / Strike</th>
              {EXPIRIES.map((e) => (
                <th key={e.label} className="px-4 py-3 text-right">
                  {e.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEVERAGES.map((lev) => {
              const q = quoteOption({
                spot,
                leverage: lev,
                expiryHours: 24,
                side: "UP",
                sizeUsd: 500,
                iv: market.iv,
              });
              return (
                <tr key={lev} className="border-b border-border">
                  <td className="px-4 py-3 font-mono">
                    {lev}× · {formatUsd(q.strike)}
                  </td>
                  {EXPIRIES.map((e) => {
                    const cell = quoteOption({
                      spot,
                      leverage: lev,
                      expiryHours: e.hours,
                      side: "UP",
                      sizeUsd: 500,
                      iv: market.iv,
                    });
                    return (
                      <td key={e.label} className="px-2 py-2 text-right">
                        <button
                          data-cursor
                          onClick={() =>
                            router.push(
                              `/trade?symbol=${symbol}&lev=${lev}&exp=${e.hours}`
                            )
                          }
                          className="font-mono text-copper hover:bg-copper-dim px-3 py-2 border border-transparent hover:border-copper/30 w-full"
                        >
                          {formatUsd(cell.premium)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted font-mono">
        Premiums for $500 size UP · switch markets from Trade
      </p>
    </div>
  );
}
