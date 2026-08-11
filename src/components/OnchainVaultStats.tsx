"use client";

import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import {
  hoodContracts,
  isOnchainLive,
  usdgAbi,
  vaultAbi,
} from "@/lib/chain/contracts";
import { robinhoodChain } from "@/lib/chain/wagmi";

function usd(value: bigint | undefined) {
  return value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(formatUnits(value, 6)));
}

export function OnchainVaultStats() {
  const { address } = useAccount();
  const enabled = isOnchainLive;
  const balance = useReadContract({
    address: hoodContracts.usdg,
    abi: usdgAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(enabled && address) },
  });
  const assets = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "totalAssets",
    chainId: robinhoodChain.id,
    query: { enabled },
  });
  const shares = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "sharesOf",
    args: address ? [address] : undefined,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(enabled && address) },
  });
  const price = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "sharePrice",
    chainId: robinhoodChain.id,
    query: { enabled },
  });
  const cap = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "depositCap",
    chainId: robinhoodChain.id,
    query: { enabled },
  });
  const reserved = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "reserved",
    chainId: robinhoodChain.id,
    query: { enabled },
  });

  if (!enabled) {
    return (
      <p className="mb-6 border border-copper/30 bg-copper-dim p-3 text-xs text-muted">
        On-chain actions are disabled until the mainnet deployment addresses
        are configured.
      </p>
    );
  }

  const equity =
    shares.data !== undefined && price.data !== undefined
      ? (shares.data * price.data) / 1_000_000n
      : undefined;

  const capFill =
    assets.data !== undefined && cap.data !== undefined && cap.data > 0n
      ? Number((assets.data * 10_000n) / cap.data) / 100
      : undefined;

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-6 mb-5">
        <Stat label="Pool TVL (on-chain)" value={usd(assets.data)} />
        <Stat label="Your USDG" value={usd(balance.data)} accent />
        <Stat label="Your LP equity" value={usd(equity)} />
        <Stat
          label="Share price"
          value={price.data ? Number(formatUnits(price.data, 6)).toFixed(4) : "—"}
        />
      </div>
      <div className="border border-border p-3">
        <div className="flex justify-between font-mono text-[11px] text-muted mb-2">
          <span>PILOT POOL CAP {usd(cap.data)}</span>
          <span>RESERVED {usd(reserved.data)}</span>
        </div>
        <div className="h-1 bg-surface-2">
          <div
            className="h-1 bg-copper transition-all"
            style={{ width: `${Math.min(100, capFill ?? 0)}%` }}
          />
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
