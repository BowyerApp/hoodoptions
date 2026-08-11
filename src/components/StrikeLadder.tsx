"use client";

import clsx from "clsx";
import type { Side } from "@/lib/protocol/pricing";

type Props = {
  spot: number;
  changePct: number;
  activeSide: Side;
  activeLeverage: number;
  onPick: (side: Side, leverage: number) => void;
};

const LEVELS = [10, 8, 6, 5, 4, 3, 2] as const;

function strikeFor(spot: number, side: Side, leverage: number) {
  const band = leverage * 150; // 1.5% per leverage point, mirrors the contract
  return side === "UP"
    ? (spot * (10_000 + band)) / 10_000
    : (spot * (10_000 - band)) / 10_000;
}

function premiumPct(leverage: number) {
  return (1600 + leverage * 200) / 100; // 20–36%
}

function payoutMultiple(leverage: number) {
  return (120 + leverage * 80) / 100; // 2.8x–9.2x
}

function fmt(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Contract ladder rendered like an exchange book. Every row is a live quote
 * from the engine's pricing formula — click a row to load it in the ticket.
 */
export function StrikeLadder({
  spot,
  changePct,
  activeSide,
  activeLeverage,
  onPick,
}: Props) {
  const renderRow = (side: Side, leverage: number) => {
    const strike = strikeFor(spot, side, leverage);
    const premium = premiumPct(leverage);
    const multiple = payoutMultiple(leverage);
    // Depth bar ∝ payout capacity per unit of collateral: near strikes run deep.
    const depth = (2.8 / multiple) * 100;
    const active = activeSide === side && activeLeverage === leverage;
    const up = side === "UP";

    return (
      <button
        key={`${side}${leverage}`}
        data-cursor
        onClick={() => onPick(side, leverage)}
        className={clsx(
          "relative grid w-full grid-cols-[44px_1fr_64px_52px] items-center gap-2 px-3 py-[7px] text-left font-mono text-[11.5px] transition-colors",
          active ? "bg-copper-dim" : "hover:bg-surface-2"
        )}
      >
        <span
          className="absolute inset-y-0 right-0 opacity-[0.07]"
          style={{
            width: `${depth}%`,
            backgroundColor: up ? "var(--up)" : "var(--down)",
          }}
        />
        <span className={up ? "text-up" : "text-down"}>
          {side} {leverage}×
        </span>
        <span className={clsx("text-right", active ? "text-text" : "text-muted")}>
          {fmt(strike)}
        </span>
        <span className="text-right text-muted">{premium.toFixed(0)}%</span>
        <span className={clsx("text-right", active ? "text-copper" : "text-muted")}>
          {multiple.toFixed(1)}×
        </span>
      </button>
    );
  };

  return (
    <div className="border border-border bg-surface/40">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
          CONTRACT LADDER
        </span>
        <span className="font-mono text-[10px] text-muted">
          STRIKE · PREMIUM · PAYOUT
        </span>
      </div>

      <div className="grid grid-cols-[44px_1fr_64px_52px] gap-2 px-3 py-2 font-mono text-[10px] tracking-wider text-muted border-b border-border">
        <span>SIDE</span>
        <span className="text-right">STRIKE</span>
        <span className="text-right">PREM</span>
        <span className="text-right">PAYS</span>
      </div>

      {/* UP strikes stack above spot, furthest strike at the top — reads like an ask book */}
      <div>{LEVELS.map((l) => renderRow("UP", l))}</div>

      <div className="flex items-center justify-between border-y border-copper/25 bg-copper-dim/40 px-3 py-2">
        <span className="font-mono text-[13px] text-text tick-flash" key={spot}>
          {fmt(spot)}
        </span>
        <span
          className={clsx(
            "font-mono text-[11px]",
            changePct >= 0 ? "text-up" : "text-down"
          )}
        >
          {changePct >= 0 ? "+" : ""}
          {changePct.toFixed(2)}% · ORACLE SPOT
        </span>
      </div>

      <div>{LEVELS.slice().reverse().map((l) => renderRow("DOWN", l))}</div>

      <div className="border-t border-border px-3 py-2 font-mono text-[10px] text-muted">
        Quotes are computed by the engine contract — what you click is what
        settles.
      </div>
    </div>
  );
}
