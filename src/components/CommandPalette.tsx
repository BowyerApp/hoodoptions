"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MARKETS } from "@/lib/chain/robinhood";
import { formatUsd, useForge } from "@/store/forge";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const prices = useForge((s) => s.venue?.prices);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const filtered = MARKETS.filter(
    (m) =>
      m.symbol.toLowerCase().includes(q.toLowerCase()) ||
      m.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-cursor
      >
        <div className="border-b border-border px-4 py-3">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stock tokens…"
            className="w-full bg-transparent outline-none font-mono text-sm placeholder:text-muted"
          />
        </div>
        <ul className="max-h-80 overflow-auto py-2">
          {filtered.map((m) => (
            <li key={m.symbol}>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-copper-dim transition-colors"
                onClick={() => {
                  setOpen(false);
                  router.push(`/trade?symbol=${m.symbol}`);
                }}
              >
                <span>
                  <span className="font-mono tracking-wide">{m.symbol}</span>
                  <span className="text-muted text-sm ml-3">{m.name}</span>
                </span>
                <span className="font-mono text-sm">
                  {formatUsd(prices?.[m.symbol] ?? m.basePrice)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border px-4 py-2 text-xs text-muted font-mono">
          ⌘K · Enter to trade
        </div>
      </div>
    </div>
  );
}
