"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MARKETS, getMarket } from "@/lib/chain/robinhood";
import {
  EXPIRIES,
  LEVERAGES,
  quoteOption,
  type Side,
} from "@/lib/protocol/pricing";
import { PayoffChart } from "@/components/PayoffChart";
import { PriceChart } from "@/components/PriceChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { formatPct, formatUsd, useForge } from "@/store/forge";
import clsx from "clsx";

function TradeInner() {
  const params = useSearchParams();
  const initial = params.get("symbol") || "NVDA";
  const [symbol, setSymbol] = useState(initial);
  const [side, setSide] = useState<Side>("UP");
  const [leverage, setLeverage] = useState(
    Number(params.get("lev")) || 5
  );
  const [expiryHours, setExpiryHours] = useState(
    Number(params.get("exp")) || 24
  );
  const [sizeUsd, setSizeUsd] = useState(500);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const prices = useForge((s) => s.venue?.prices);
  const changes = useForge((s) => s.venue?.priceChanges);
  const openTrade = useForge((s) => s.openTrade);
  const ready = useForge((s) => s.ready);
  const usdg = useForge((s) => s.user?.usdg ?? 0);
  const market = getMarket(symbol);
  const spot = prices?.[symbol] ?? market.basePrice;

  const quote = useMemo(
    () =>
      quoteOption({
        spot,
        leverage,
        expiryHours,
        side,
        sizeUsd,
        iv: market.iv,
      }),
    [spot, leverage, expiryHours, side, sizeUsd, market.iv]
  );

  const onConfirm = async () => {
    setBusy(true);
    setMsg(null);
    const res = await openTrade({
      symbol,
      side,
      leverage,
      expiryHours,
      sizeUsd,
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error || "Failed");
      return;
    }
    setMsg(`Opened ${symbol} ${side} · premium ${formatUsd(res.premium!)}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {MARKETS.map((m) => {
          const active = m.symbol === symbol;
          const ch = changes?.[m.symbol] ?? 0;
          return (
            <button
              key={m.symbol}
              data-cursor
              onClick={() => setSymbol(m.symbol)}
              className={clsx(
                "px-3 py-2 border text-sm font-mono transition-colors",
                active
                  ? "border-copper bg-copper-dim text-text"
                  : "border-border text-muted hover:text-text"
              )}
            >
              {m.symbol}{" "}
              <span className={ch >= 0 ? "text-up" : "text-down"}>
                {formatPct(ch)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          <div className="flex items-baseline gap-4 mb-2 flex-wrap">
            <h1 className="text-3xl">{market.name}</h1>
            <span className="font-mono text-2xl tick-flash">{formatUsd(spot)}</span>
            <span className="font-mono text-xs text-muted uppercase">
              {market.kind} · live venue
            </span>
          </div>
          <div className="border border-border bg-surface/40 p-2 mb-6">
            <PriceChart symbol={symbol} />
          </div>
          <div>
            <div className="font-mono text-xs text-muted tracking-widest mb-3">
              LIVE TAPE
            </div>
            <ActivityFeed limit={8} />
          </div>
        </div>

        <div className="border border-border bg-surface p-5 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <div className="font-mono text-xs text-copper tracking-widest">
              ORDER TICKET
            </div>
            <div className="font-mono text-xs text-muted">
              Bal {formatUsd(usdg)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {(["UP", "DOWN"] as Side[]).map((s) => (
              <button
                key={s}
                data-cursor
                onClick={() => setSide(s)}
                className={clsx(
                  "py-3 font-mono text-sm border transition-colors",
                  side === s
                    ? s === "UP"
                      ? "border-up bg-up/10 text-up"
                      : "border-down bg-down/10 text-down"
                    : "border-border text-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="block text-xs text-muted mb-1 font-mono">
            LEVERAGE
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {LEVERAGES.map((l) => (
              <button
                key={l}
                data-cursor
                onClick={() => setLeverage(l)}
                className={clsx(
                  "px-3 py-1.5 font-mono text-sm border",
                  leverage === l
                    ? "border-copper text-copper"
                    : "border-border text-muted"
                )}
              >
                {l}×
              </button>
            ))}
          </div>

          <label className="block text-xs text-muted mb-1 font-mono">
            EXPIRY
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {EXPIRIES.map((e) => (
              <button
                key={e.label}
                data-cursor
                onClick={() => setExpiryHours(e.hours)}
                className={clsx(
                  "px-3 py-1.5 font-mono text-sm border",
                  expiryHours === e.hours
                    ? "border-copper text-copper"
                    : "border-border text-muted"
                )}
              >
                {e.label}
              </button>
            ))}
          </div>

          <label className="block text-xs text-muted mb-1 font-mono">
            SIZE (USD)
          </label>
          <input
            type="number"
            value={sizeUsd}
            onChange={(e) => setSizeUsd(Number(e.target.value))}
            className="w-full bg-bg border border-border px-3 py-2 font-mono mb-5 outline-none focus:border-copper"
          />

          <motion.div
            key={quote.premium}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="space-y-2 border border-border bg-bg/50 p-4 mb-4"
          >
            <div className="flex justify-between">
              <span className="text-muted text-sm">Premium / Max loss</span>
              <span className="font-mono text-lg text-copper">
                {formatUsd(quote.premium)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Strike</span>
              <span className="font-mono">{formatUsd(quote.strike)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Breakeven</span>
              <span className="font-mono">{formatUsd(quote.breakeven)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delta · Theta</span>
              <span className="font-mono">
                {quote.delta.toFixed(3)} · {quote.theta.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">2× / 5× / 10× payoff</span>
              <span className="font-mono text-xs">
                {formatUsd(quote.payoffMultipliers.x2)} /{" "}
                {formatUsd(quote.payoffMultipliers.x5)} /{" "}
                {formatUsd(quote.payoffMultipliers.x10)}
              </span>
            </div>
          </motion.div>

          <PayoffChart
            side={side}
            premium={quote.premium}
            strike={quote.strike}
            spot={spot}
          />

          <button
            data-cursor
            disabled={busy || !ready}
            onClick={onConfirm}
            className="mt-4 w-full bg-copper text-bg py-3 font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy
              ? "Submitting…"
              : `Confirm · pay ${formatUsd(quote.premium)} USDG`}
          </button>
          {msg && (
            <p className="mt-3 text-sm font-mono text-muted">{msg}</p>
          )}
          <p className="mt-3 text-xs text-muted">
            Live shared venue · premium settles to USDG vault · no liquidation
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading desk…</div>}>
      <TradeInner />
    </Suspense>
  );
}
