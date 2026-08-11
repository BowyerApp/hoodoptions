"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  hoodTestnetContracts,
  isTestnetLive,
  usdgAbi,
} from "@/lib/chain/contracts";
import { robinhoodTestnet } from "@/lib/chain/wagmi";

export function TestnetFaucetButton() {
  const { chainId, isConnected } = useAccount();
  const client = usePublicClient({ chainId: robinhoodTestnet.id });
  const { writeContractAsync } = useWriteContract();
  const [pending, setPending] = useState(false);

  if (!isTestnetLive) return null;

  const claim = async () => {
    if (!isConnected) return alert("Connect your wallet first.");
    if (chainId !== robinhoodTestnet.id)
      return alert("Switch to Robinhood Chain Testnet.");
    if (!client) return;
    setPending(true);
    try {
      const hash = await writeContractAsync({
        address: hoodTestnetContracts.usdg!,
        abi: usdgAbi,
        functionName: "faucet",
        chainId: robinhoodTestnet.id,
      });
      await client.waitForTransactionReceipt({ hash });
      alert("10,000 testnet USDG claimed.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Faucet transaction failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      data-cursor
      disabled={pending}
      onClick={claim}
      className="hidden sm:inline-flex items-center rounded-sm border border-border-strong px-3 py-1.5 font-mono text-[12px] text-copper transition-colors hover:bg-copper-dim disabled:opacity-50"
    >
      {pending ? "Claiming…" : "Claim test USDG"}
    </button>
  );
}
