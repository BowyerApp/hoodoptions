"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatUsd, useForge } from "@/store/forge";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function EarnPage() {
  const [amount, setAmount] = useState(1000);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const user = useForge((s) => s.user);
  const venue = useForge((s) => s.venue);
  const deposit = useForge((s) => s.deposit);
  const withdraw = useForge((s) => s.withdraw);

  const usdg = user?.usdg ?? 0;
  const vaultAssets = venue?.vaultAssets ?? 0;
  const sharePrice = venue?.sharePrice ?? 1;
  const lpEquity = user?.lpEquity ?? 0;
  const available = user?.availableWithdraw ?? 0;
  const util = venue?.utilization ?? 0;
  const apy = venue?.apy ?? 0;
  const lpShares = user?.lpShares ?? 0;

  const submit = async () => {
    setBusy(true);
    const res = mode === "deposit" ? await deposit(amount) : await withdraw(amount);
    setBusy(false);
    setMsg(
      res.ok
        ? `${mode === "deposit" ? "Deposited" : "Withdrew"} ${formatUsd(amount)}`
        : res.error || "Failed"
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        USDG LIQUIDITY VAULT · LIVE
      </div>
      <h1 className="text-4xl mb-2">Earn as the house</h1>
      <p className="text-muted max-w-xl mb-10">
        Deposit USDG into the shared vault. Earn premiums from every trader on
        HoodOptions. Withdraw when capital is free.
      </p>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
        <div className="border border-border bg-surface p-6">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Stat label="Vault TVL" value={formatUsd(vaultAssets, 0)} />
            <Stat label="Est. APY" value={`${(apy * 100).toFixed(1)}%`} accent />
            <Stat label="Share price" value={sharePrice.toFixed(4)} />
            <Stat label="Your LP equity" value={formatUsd(lpEquity)} />
          </div>

          <div className="mb-2 flex justify-between text-xs font-mono text-muted">
            <span>Utilization</span>
            <span>{(util * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-bg mb-8">
            <motion.div
              className="h-full bg-copper"
              animate={{ width: `${util * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {(["deposit", "withdraw"] as const).map((m) => (
              <button
                key={m}
                data-cursor
                onClick={() => setMode(m)}
                className={`py-2 font-mono text-sm border capitalize ${
                  mode === m
                    ? "border-copper text-copper"
                    : "border-border text-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <label className="block text-xs text-muted font-mono mb-1">
            AMOUNT USDG
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-bg border border-border px-3 py-3 font-mono mb-2 outline-none focus:border-copper"
          />
          <div className="flex justify-between text-xs text-muted font-mono mb-4">
            <span>Wallet {formatUsd(usdg)}</span>
            <span>Available out {formatUsd(available)}</span>
          </div>

          <button
            data-cursor
            disabled={busy}
            onClick={submit}
            className="w-full bg-copper text-bg py-3 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {busy
              ? "Processing…"
              : mode === "deposit"
                ? "Deposit USDG"
                : "Withdraw USDG"}
          </button>
          {msg && <p className="mt-3 text-sm font-mono text-muted">{msg}</p>}
          <p className="mt-4 text-xs text-muted">
            LP shares: {lpShares.toFixed(4)} · Shared with all live traders
          </p>
        </div>

        <div>
          <div className="font-mono text-xs text-muted tracking-widest mb-3">
            LIVE FLOW
          </div>
          <ActivityFeed limit={12} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-muted font-mono mb-1">{label}</div>
      <div className={`text-2xl font-mono ${accent ? "text-copper" : ""}`}>
        {value}
      </div>
    </div>
  );
}
