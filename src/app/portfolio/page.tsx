"use client";

import { formatUsd, useForge } from "@/store/forge";

export default function PortfolioPage() {
  const user = useForge((s) => s.user);
  const prices = useForge((s) => s.venue?.prices);
  const claim = useForge((s) => s.claim);
  const hydrate = useForge((s) => s.hydrate);
  const positions = user?.positions ?? [];
  const history = user?.history ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-copper tracking-widest mb-3">
            BLOTTER · LIVE
          </div>
          <h1 className="text-4xl">Portfolio</h1>
        </div>
        <button
          data-cursor
          onClick={() => hydrate()}
          className="border border-border px-4 py-2 text-xs font-mono text-muted hover:text-text"
        >
          Refresh
        </button>
      </div>

      <h2 className="font-mono text-xs text-muted tracking-widest mb-3">
        OPEN POSITIONS
      </h2>
      <div className="border border-border overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted font-mono border-b border-border">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Lev</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Strike</th>
              <th className="px-4 py-3">Mark</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-muted">
                  No open positions —{" "}
                  <a href="/trade" className="text-copper">
                    open a trade
                  </a>
                </td>
              </tr>
            )}
            {positions.map((p) => {
              const mark = prices?.[p.symbol] ?? p.entrySpot;
              const mins = Math.max(
                0,
                Math.round((p.expiresAt - Date.now()) / 60000)
              );
              return (
                <tr key={p.id} className="border-b border-border">
                  <td className="px-4 py-3 font-mono">{p.symbol}</td>
                  <td
                    className={`px-4 py-3 font-mono ${
                      p.side === "UP" ? "text-up" : "text-down"
                    }`}
                  >
                    {p.side}
                  </td>
                  <td className="px-4 py-3 font-mono">{p.leverage}×</td>
                  <td className="px-4 py-3 font-mono">{formatUsd(p.premium)}</td>
                  <td className="px-4 py-3 font-mono">{formatUsd(p.strike)}</td>
                  <td className="px-4 py-3 font-mono">{formatUsd(mark)}</td>
                  <td className="px-4 py-3 font-mono text-muted">{mins}m</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      data-cursor
                      onClick={() => claim(p.id)}
                      className="text-xs font-mono text-copper border border-copper/40 px-2 py-1 hover:bg-copper-dim"
                    >
                      Settle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="font-mono text-xs text-muted tracking-widest mb-3">
        HISTORY
      </h2>
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted font-mono border-b border-border">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">PnL</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  Settled trades appear here
                </td>
              </tr>
            )}
            {history.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="px-4 py-3 font-mono">
                  {p.symbol} {p.side}
                </td>
                <td
                  className={`px-4 py-3 font-mono ${
                    p.status === "won" ? "text-up" : "text-down"
                  }`}
                >
                  {p.status}
                </td>
                <td className="px-4 py-3 font-mono">{formatUsd(p.premium)}</td>
                <td className="px-4 py-3 font-mono">
                  {formatUsd(p.payout ?? 0)}
                </td>
                <td
                  className={`px-4 py-3 font-mono ${
                    (p.pnl ?? 0) >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {formatUsd(p.pnl ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
