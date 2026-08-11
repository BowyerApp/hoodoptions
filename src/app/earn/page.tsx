"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForge } from "@/store/forge";
import { OnchainVaultAction } from "@/components/OnchainVaultAction";
import { OnchainVaultStats } from "@/components/OnchainVaultStats";

export default function EarnPage() {
  const [amount, setAmount] = useState(1000);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [msg, setMsg] = useState<string | null>(null);
  const venue = useForge((s) => s.venue);
  const util = venue?.utilization ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        USDG LIQUIDITY VAULT · ROBINHOOD TESTNET
      </div>
      <h1 className="text-4xl mb-2">Earn as the house</h1>
      <p className="text-muted max-w-xl mb-10">
        Deposit USDG into the shared vault. Earn premiums from every trader on
        HoodOptions. Withdraw when capital is free.
      </p>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
        <div className="border border-border bg-surface p-6">
          <OnchainVaultStats />

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
          <OnchainVaultAction mode={mode} amount={amount} onStatus={setMsg} />
          {msg && <p className="mt-3 text-sm font-mono text-muted">{msg}</p>}
          <p className="mt-4 text-xs text-muted">
            Contract state is authoritative. Testnet USDG only.
          </p>
        </div>

        <div>
          <div className="border border-border bg-surface p-6">
            <div className="font-mono text-xs text-copper tracking-widest mb-4">
              TESTNET VAULT MODEL
            </div>
            <ol className="space-y-4 text-sm text-muted">
              <li><span className="text-text">01</span> Connect on Robinhood Chain Testnet.</li>
              <li><span className="text-text">02</span> Claim testnet USDG from the token faucet.</li>
              <li><span className="text-text">03</span> Approve and deposit USDG; receive vault shares.</li>
              <li><span className="text-text">04</span> Withdrawable liquidity is enforced by the vault&apos;s 80% utilization cap.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

