"use client";

import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import {
  hoodTestnetContracts,
  isTestnetLive,
  usdgAbi,
  vaultAbi,
} from "@/lib/chain/contracts";
import { robinhoodTestnet } from "@/lib/chain/wagmi";

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
  const enabled = isTestnetLive;
  const balance = useReadContract({
    address: hoodTestnetContracts.usdg,
    abi: usdgAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: robinhoodTestnet.id,
    query: { enabled: Boolean(enabled && address) },
  });
  const assets = useReadContract({
    address: hoodTestnetContracts.vault,
    abi: vaultAbi,
    functionName: "totalAssets",
    chainId: robinhoodTestnet.id,
    query: { enabled },
  });
  const shares = useReadContract({
    address: hoodTestnetContracts.vault,
    abi: vaultAbi,
    functionName: "sharesOf",
    args: address ? [address] : undefined,
    chainId: robinhoodTestnet.id,
    query: { enabled: Boolean(enabled && address) },
  });
  const price = useReadContract({
    address: hoodTestnetContracts.vault,
    abi: vaultAbi,
    functionName: "sharePrice",
    chainId: robinhoodTestnet.id,
    query: { enabled },
  });

  if (!enabled) {
    return (
      <p className="mb-6 border border-copper/30 bg-copper-dim p-3 text-xs text-muted">
        On-chain testnet actions are disabled until the deployment addresses
        are configured.
      </p>
    );
  }

  const equity =
    shares.data !== undefined && price.data !== undefined
      ? (shares.data * price.data) / 1_000_000n
      : undefined;

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <Stat label="On-chain vault TVL" value={usd(assets.data)} />
      <Stat label="Your testnet USDG" value={usd(balance.data)} accent />
      <Stat label="Your LP equity" value={usd(equity)} />
      <Stat
        label="Share price"
        value={price.data ? Number(formatUnits(price.data, 6)).toFixed(4) : "—"}
      />
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
