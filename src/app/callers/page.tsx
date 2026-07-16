"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CALLERS, formatUsd, useForge } from "@/store/forge";

export default function CallersPage() {
  const router = useRouter();
  const openTrade = useForge((s) => s.openTrade);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        CALLERS
      </div>
      <h1 className="text-4xl mb-2">Follow strategies</h1>
      <p className="text-muted mb-10 max-w-xl">
        Copy a Caller into the live venue — real premium, real vault credit.
      </p>
      {msg && <p className="mb-6 font-mono text-sm text-copper">{msg}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        {CALLERS.map((c) => (
          <div key={c.id} className="border border-border bg-surface p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xl">{c.name}</div>
                <div className="text-sm text-muted">{c.style}</div>
              </div>
              <div className="font-mono text-xs text-up">
                {(c.winRate * 100).toFixed(0)}% WR
              </div>
            </div>
            <div className="font-mono text-sm mb-1">
              30D PnL{" "}
              <span className="text-copper">{formatUsd(c.pnl30d, 0)}</span>
            </div>
            <div className="font-mono text-xs text-muted mb-6">
              Latest: {c.symbol} {c.side} {c.leverage}× · {c.expiryHours}H
            </div>
            <div className="flex gap-2">
              <button
                data-cursor
                className="flex-1 bg-copper text-bg py-2 text-sm"
                onClick={async () => {
                  const res = await openTrade({
                    symbol: c.symbol,
                    side: c.side,
                    leverage: c.leverage,
                    expiryHours: c.expiryHours,
                    sizeUsd: 250,
                  });
                  if (res.ok) {
                    setMsg(`Copied ${c.name}`);
                    router.push("/portfolio");
                  } else setMsg(res.error || "Failed");
                }}
              >
                Copy trade
              </button>
              <button
                data-cursor
                className="border border-border px-3 py-2 text-sm text-muted"
                onClick={() => router.push(`/trade?symbol=${c.symbol}`)}
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
