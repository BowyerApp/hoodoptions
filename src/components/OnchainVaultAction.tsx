"use client";

import { useMemo, useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import {
  hoodContracts,
  isOnchainLive,
  usdgAbi,
  vaultAbi,
} from "@/lib/chain/contracts";
import { robinhoodChain } from "@/lib/chain/wagmi";

type Props = {
  mode: "deposit" | "withdraw";
  amount: number;
  onStatus: (message: string) => void;
};

export function OnchainVaultAction({ mode, amount, onStatus }: Props) {
  const { address, chainId, isConnected } = useAccount();
  const client = usePublicClient({ chainId: robinhoodChain.id });
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const assets = useMemo(() => {
    try {
      return parseUnits(Math.max(0, amount).toString(), 6);
    } catch {
      return 0n;
    }
  }, [amount]);

  const allowance = useReadContract({
    address: hoodContracts.usdg,
    abi: usdgAbi,
    functionName: "allowance",
    args:
      address && hoodContracts.vault ? [address, hoodContracts.vault] : undefined,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(address && isOnchainLive) },
  });
  const totalAssets = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "totalAssets",
    chainId: robinhoodChain.id,
    query: { enabled: isOnchainLive },
  });
  const totalShares = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "totalShares",
    chainId: robinhoodChain.id,
    query: { enabled: isOnchainLive },
  });
  const depositCap = useReadContract({
    address: hoodContracts.vault,
    abi: vaultAbi,
    functionName: "depositCap",
    chainId: robinhoodChain.id,
    query: { enabled: isOnchainLive },
  });

  const submit = async () => {
    if (!isOnchainLive) return onStatus("Contracts are not deployed yet.");
    if (!isConnected || !address) return onStatus("Connect a wallet first.");
    if (chainId !== robinhoodChain.id)
      return onStatus("Switch to Robinhood Chain.");
    if (!client || assets === 0n) return onStatus("Enter a valid USDG amount.");

    setBusy(true);
    try {
      if (mode === "deposit") {
        const cap = depositCap.data ?? 0n;
        const tvl = totalAssets.data ?? 0n;
        if (cap > 0n && tvl + assets > cap) {
          return onStatus(
            "The pilot pool cap would be exceeded — try a smaller amount."
          );
        }
        if ((allowance.data ?? 0n) < assets) {
          onStatus("Approve USDG in your wallet…");
          const approval = await writeContractAsync({
            address: hoodContracts.usdg,
            abi: usdgAbi,
            functionName: "approve",
            args: [hoodContracts.vault!, assets],
            chainId: robinhoodChain.id,
          });
          await client.waitForTransactionReceipt({ hash: approval });
        }
        onStatus("Confirm vault deposit…");
        const hash = await writeContractAsync({
          address: hoodContracts.vault!,
          abi: vaultAbi,
          functionName: "deposit",
          args: [assets],
          chainId: robinhoodChain.id,
        });
        await client.waitForTransactionReceipt({ hash });
        onStatus("USDG deposited. You are now earning premiums.");
      } else {
        const vaultAssets = totalAssets.data ?? 0n;
        const shares = totalShares.data ?? 0n;
        if (vaultAssets === 0n || shares === 0n)
          return onStatus("Vault has no withdrawable liquidity.");
        const sharesToWithdraw = (assets * shares) / vaultAssets;
        if (sharesToWithdraw === 0n) return onStatus("Amount is too small.");
        onStatus("Confirm vault withdrawal…");
        const hash = await writeContractAsync({
          address: hoodContracts.vault!,
          abi: vaultAbi,
          functionName: "withdraw",
          args: [sharesToWithdraw],
          chainId: robinhoodChain.id,
        });
        await client.waitForTransactionReceipt({ hash });
        onStatus("USDG withdrawn to your wallet.");
      }
      await allowance.refetch();
      await totalAssets.refetch();
      await totalShares.refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed";
      onStatus(message.length > 140 ? `${message.slice(0, 137)}…` : message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      data-cursor
      disabled={!isOnchainLive || busy || assets === 0n}
      onClick={submit}
      className="w-full bg-copper py-3 font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {busy
        ? "Confirming on-chain…"
        : !isOnchainLive
          ? "Mainnet deployment pending"
          : mode === "deposit"
            ? "Deposit USDG"
            : "Withdraw USDG"}
    </button>
  );
}
