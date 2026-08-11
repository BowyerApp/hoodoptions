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
  hoodContracts,
  isOnchainLive,
  usdgAbi,
} from "@/lib/chain/contracts";
import { robinhoodChain } from "@/lib/chain/wagmi";
import { txErrorToast, txSuccessToast } from "@/lib/txToast";
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
 * Real-money flow: wallet → contract only. There is no server-side ledger;
 * the premium leaves the user's wallet and the vault reserves the payout.
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
  const publicClient = usePublicClient({ chainId: robinhoodChain.id });
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
    address: hoodContracts.engine,
    abi: engineAbi,
    functionName: "quote",
    args: [marketId, leverage, size],
    chainId: robinhoodChain.id,
    query: { enabled: isOnchainLive && size > 0n },
  });

  const allowance = useReadContract({
    address: hoodContracts.usdg,
    abi: usdgAbi,
    functionName: "allowance",
    args:
      address && hoodContracts.engine
        ? [address, hoodContracts.engine]
        : undefined,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(address && isOnchainLive) },
  });

  const premium = quote.data?.[0] ?? 0n;
  const approved = (allowance.data ?? 0n) >= premium;
  const onRobinhood = chainId === robinhoodChain.id;

  const submit = async () => {
    if (!isOnchainLive) {
      onStatus("Contracts are not deployed yet.");
      return;
    }
    if (!isConnected || !address) {
      onStatus("Connect a wallet first.");
      return;
    }
    if (!onRobinhood) {
      onStatus("Switch your wallet to Robinhood Chain.");
      return;
    }
    if (!publicClient || premium === 0n) {
      onStatus("Waiting for a fresh oracle quote. Markets may be closed.");
      return;
    }

    setBusy(true);
    onBusy(true);
    try {
      if (!approved) {
        onStatus("Approve USDG in your wallet…");
        const approval = await writeContractAsync({
          address: hoodContracts.usdg,
          abi: usdgAbi,
          functionName: "approve",
          args: [hoodContracts.engine!, premium],
          chainId: robinhoodChain.id,
        });
        await publicClient.waitForTransactionReceipt({ hash: approval });
      }

      onStatus("Confirm the option in your wallet…");
      const expiry = BigInt(Math.floor(Date.now() / 1000) + expiryHours * 3600);
      const hash = await writeContractAsync({
        address: hoodContracts.engine!,
        abi: engineAbi,
        functionName: "open",
        args: [marketId, side === "UP" ? 0 : 1, leverage, expiry, size],
        chainId: robinhoodChain.id,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      onStatus(
        `Option live on Robinhood Chain · ${formatUnits(premium, 6)} USDG premium`
      );
      txSuccessToast(
        "Option opened",
        receipt.transactionHash,
        `${formatUnits(premium, 6)} USDG premium · max loss = premium`
      );
      await quote.refetch();
      await allowance.refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed";
      onStatus(message.length > 140 ? `${message.slice(0, 137)}…` : message);
      txErrorToast(message);
    } finally {
      setBusy(false);
      onBusy(false);
    }
  };

  if (!isOnchainLive) {
    return (
      <button
        disabled
        className="mt-4 w-full border border-border bg-surface-2 py-3 font-medium text-muted"
      >
        Mainnet deployment pending
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
          : quote.isError
            ? "Market closed — quotes resume at the open"
            : `Buy option · ${formatUnits(premium, 6)} USDG`}
    </button>
  );
}
