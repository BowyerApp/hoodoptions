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
  hoodTestnetContracts,
  isTestnetLive,
  usdgAbi,
  vaultAbi,
} from "@/lib/chain/contracts";
import { robinhoodTestnet } from "@/lib/chain/wagmi";

type Props = {
  mode: "deposit" | "withdraw";
  amount: number;
  onStatus: (message: string) => void;
};

export function OnchainVaultAction({ mode, amount, onStatus }: Props) {
  const { address, chainId, isConnected } = useAccount();
  const client = usePublicClient({ chainId: robinhoodTestnet.id });
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
    address: hoodTestnetContracts.usdg,
    abi: usdgAbi,
    functionName: "allowance",
    args: address && hoodTestnetContracts.vault
      ? [address, hoodTestnetContracts.vault]
      : undefined,
    chainId: robinhoodTestnet.id,
    query: { enabled: Boolean(address && isTestnetLive) },
  });
  const totalAssets = useReadContract({
    address: hoodTestnetContracts.vault,
    abi: vaultAbi,
    functionName: "totalAssets",
    chainId: robinhoodTestnet.id,
    query: { enabled: isTestnetLive },
  });
  const totalShares = useReadContract({
    address: hoodTestnetContracts.vault,
    abi: vaultAbi,
    functionName: "totalShares",
    chainId: robinhoodTestnet.id,
    query: { enabled: isTestnetLive },
  });

  const submit = async () => {
    if (!isTestnetLive) return onStatus("Testnet contracts are not configured yet.");
    if (!isConnected || !address) return onStatus("Connect a wallet first.");
    if (chainId !== robinhoodTestnet.id)
      return onStatus("Switch to Robinhood Chain Testnet.");
    if (!client || assets === 0n) return onStatus("Enter a valid USDG amount.");

    setBusy(true);
    try {
      if (mode === "deposit") {
        if ((allowance.data ?? 0n) < assets) {
          onStatus("Approve testnet USDG in your wallet…");
          const approval = await writeContractAsync({
            address: hoodTestnetContracts.usdg!,
            abi: usdgAbi,
            functionName: "approve",
            args: [hoodTestnetContracts.vault!, assets],
            chainId: robinhoodTestnet.id,
          });
          await client.waitForTransactionReceipt({ hash: approval });
        }
        onStatus("Confirm vault deposit…");
        const hash = await writeContractAsync({
          address: hoodTestnetContracts.vault!,
          abi: vaultAbi,
          functionName: "deposit",
          args: [assets],
          chainId: robinhoodTestnet.id,
        });
        await client.waitForTransactionReceipt({ hash });
        onStatus("Testnet USDG deposited on-chain.");
      } else {
        const vaultAssets = totalAssets.data ?? 0n;
        const shares = totalShares.data ?? 0n;
        if (vaultAssets === 0n || shares === 0n)
          return onStatus("Vault has no withdrawable liquidity.");
        const sharesToWithdraw = (assets * shares) / vaultAssets;
        if (sharesToWithdraw === 0n) return onStatus("Amount is too small.");
        onStatus("Confirm vault withdrawal…");
        const hash = await writeContractAsync({
          address: hoodTestnetContracts.vault!,
          abi: vaultAbi,
          functionName: "withdraw",
          args: [sharesToWithdraw],
          chainId: robinhoodTestnet.id,
        });
        await client.waitForTransactionReceipt({ hash });
        onStatus("Testnet USDG withdrawn on-chain.");
      }
      await allowance.refetch();
      await totalAssets.refetch();
      await totalShares.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed";
      onStatus(message.length > 140 ? `${message.slice(0, 137)}…` : message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      data-cursor
      disabled={!isTestnetLive || busy || assets === 0n}
      onClick={submit}
      className="w-full bg-copper py-3 font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {busy
        ? "Confirming on-chain…"
        : !isTestnetLive
          ? "Testnet deployment pending"
          : mode === "deposit"
            ? "Deposit testnet USDG on-chain"
            : "Withdraw testnet USDG on-chain"}
    </button>
  );
}
