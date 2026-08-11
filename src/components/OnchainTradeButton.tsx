"use client";

import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import {
  engineAbi,
  hoodTestnetContracts,
  isTestnetLive,
  usdgAbi,
} from "@/lib/chain/contracts";
import { robinhoodTestnet } from "@/lib/chain/wagmi";
import type { Side } from "@/lib/protocol/pricing";

type Props = {
  marketId: number;
  side: Side;
  leverage: number;
  expiryHours: number;
  sizeUsd: number;
  onStatus: (message: string) => void;
  onBusy: (busy: boolean) => void;
};

/**
 * Transaction flow deliberately happens wallet → contract only.
 * There is no server-side trade fallback when the on-chain venue is enabled.
 */
export function OnchainTradeButton({
  marketId,
  side,
  leverage,
  expiryHours,
  sizeUsd,
  onStatus,
  onBusy,
}: Props) {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: robinhoodTestnet.id });
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);

  const size = useMemo(() => {
    try {
      return parseUnits(Math.max(0, sizeUsd).toString(), 6);
    } catch {
      return 0n;
    }
  }, [sizeUsd]);

  const quote = useReadContract({
    address: hoodTestnetContracts.engine,
    abi: engineAbi,
    functionName: "quote",
    args: [marketId, leverage, size],
    chainId: robinhoodTestnet.id,
    query: { enabled: isTestnetLive && size > 0n },
  });

  const allowance = useReadContract({
    address: hoodTestnetContracts.usdg,
    abi: usdgAbi,
    functionName: "allowance",
    args: address && hoodTestnetContracts.engine
      ? [address, hoodTestnetContracts.engine]
      : undefined,
    chainId: robinhoodTestnet.id,
    query: { enabled: Boolean(address && isTestnetLive) },
  });

  const premium = quote.data?.[0] ?? 0n;
  const approved = (allowance.data ?? 0n) >= premium;
  const onTestnet = chainId === robinhoodTestnet.id;

  const submit = async () => {
    if (!isTestnetLive) {
      onStatus("Testnet contracts are not configured yet.");
      return;
    }
    if (!isConnected || !address) {
      onStatus("Connect a wallet first.");
      return;
    }
    if (!onTestnet) {
      onStatus("Switch your wallet to Robinhood Chain Testnet.");
      return;
    }
    if (!publicClient || premium === 0n) {
      onStatus("Waiting for the testnet oracle quote.");
      return;
    }

    setBusy(true);
    onBusy(true);
    try {
      if (!approved) {
        onStatus("Approve USDG in your wallet…");
        const approval = await writeContractAsync({
          address: hoodTestnetContracts.usdg!,
          abi: usdgAbi,
          functionName: "approve",
          args: [hoodTestnetContracts.engine!, premium],
          chainId: robinhoodTestnet.id,
        });
        await publicClient.waitForTransactionReceipt({ hash: approval });
      }

      onStatus("Confirm option on Robinhood Chain Testnet…");
      const expiry = BigInt(Math.floor(Date.now() / 1000) + expiryHours * 3600);
      const hash = await writeContractAsync({
        address: hoodTestnetContracts.engine!,
        abi: engineAbi,
        functionName: "open",
        args: [
          marketId,
          side === "UP" ? 0 : 1,
          leverage,
          expiry,
          size,
        ],
        chainId: robinhoodTestnet.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      onStatus(
        `On-chain option opened · ${formatUnits(premium, 6)} USDG premium · tx ${receipt.transactionHash.slice(0, 10)}…`
      );
      await quote.refetch();
      await allowance.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed";
      onStatus(message.length > 140 ? `${message.slice(0, 137)}…` : message);
    } finally {
      setBusy(false);
      onBusy(false);
    }
  };

  if (!isTestnetLive) {
    return (
      <button
        disabled
        className="mt-4 w-full border border-border bg-surface-2 py-3 font-medium text-muted"
      >
        Testnet deployment pending
      </button>
    );
  }

  return (
    <button
      data-cursor
      disabled={busy || quote.isLoading || quote.isError || size === 0n}
      onClick={submit}
      className="mt-4 w-full bg-copper py-3 font-medium tracking-wide text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {busy
        ? "Confirming on-chain…"
        : quote.isLoading
          ? "Loading on-chain quote…"
          : `Open on testnet · ${formatUnits(premium, 6)} USDG`}
    </button>
  );
}
