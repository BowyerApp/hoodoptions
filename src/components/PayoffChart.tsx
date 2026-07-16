"use client";

import type { Side } from "@/lib/protocol/pricing";

export function PayoffChart({
  side,
  premium,
  strike,
  spot,
}: {
  side: Side;
  premium: number;
  strike: number;
  spot: number;
}) {
  const w = 320;
  const h = 120;
  const midY = h * 0.55;
  const points: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const px = (i / 40) * w;
    const price = spot * (0.85 + (i / 40) * 0.3);
    let pnl = -premium;
    if (side === "UP") {
      pnl = price >= strike ? premium * 1.8 * ((price - strike) / (spot * 0.05)) - premium : -premium;
      pnl = Math.min(pnl, premium * 4);
    } else {
      pnl = price <= strike ? premium * 1.8 * ((strike - price) / (spot * 0.05)) - premium : -premium;
      pnl = Math.min(pnl, premium * 4);
    }
    const py = midY - (pnl / (premium * 4 || 1)) * 40;
    points.push(`${px},${Math.max(8, Math.min(h - 8, py))}`);
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28 text-copper">
      <line x1="0" y1={midY} x2={w} y2={midY} stroke="currentColor" strokeOpacity="0.2" />
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        points={points.join(" ")}
      />
      <text x="8" y="16" className="fill-muted" fontSize="10" fontFamily="var(--font-plex)">
        Payoff · max loss = premium
      </text>
      <text x="8" y={h - 8} className="fill-muted" fontSize="10" fontFamily="var(--font-plex)">
        Spot {spot.toFixed(2)} · Strike {strike.toFixed(2)}
      </text>
    </svg>
  );
}
