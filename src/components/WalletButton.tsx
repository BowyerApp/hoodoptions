"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { formatUnits } from "viem";
import { robinhoodChain } from "@/lib/chain/wagmi";
import { useForge } from "@/store/forge";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: bal } = useBalance({ address, chainId: robinhoodChain.id });
  const bindWallet = useForge((s) => s.bindWallet);
  const [open, setOpen] = useState(false);
  const bound = useRef<string | null>(null);

  const onRobinhood = chainId === robinhoodChain.id || chainId === 46630;

  // Bind the connected wallet to the venue account exactly once per address.
  useEffect(() => {
    if (address && bound.current !== address) {
      bound.current = address;
      bindWallet(address);
    }
  }, [address, bindWallet]);

  if (!isConnected) {
    return (
      <button
        data-cursor
        disabled={isPending}
        className="inline-flex items-center rounded-sm bg-copper px-3.5 py-1.5 text-[12px] font-medium text-bg hover:opacity-90 transition-opacity disabled:opacity-50"
        onClick={() => {
          const injected = connectors[0];
          if (!injected) {
            alert("No wallet detected. Install MetaMask or Robinhood Wallet.");
            return;
          }
          connect({ connector: injected });
        }}
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        data-cursor
        className="inline-flex items-center gap-2 rounded-sm border border-border-strong px-3 py-1.5 text-[12px] font-mono hover:bg-surface transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${onRobinhood ? "bg-up" : "bg-down"}`}
        />
        {short(address!)}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 border border-border bg-surface p-4 text-sm shadow-2xl z-50">
          <div className="font-mono text-xs text-muted mb-1">WALLET</div>
          <div className="font-mono text-[13px] break-all mb-3">{address}</div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-muted">Network</span>
            <span className={onRobinhood ? "text-up" : "text-down"}>
              {onRobinhood ? "Robinhood Chain" : "Wrong network"}
            </span>
          </div>
          <div className="flex justify-between text-xs font-mono mb-3">
            <span className="text-muted">ETH</span>
            <span>
              {bal ? Number(formatUnits(bal.value, bal.decimals)).toFixed(5) : "0.00000"}
            </span>
          </div>
          {!onRobinhood && (
            <button
              className="w-full mb-2 rounded-sm bg-copper px-3 py-1.5 text-[12px] font-medium text-bg"
              onClick={() => switchChain({ chainId: robinhoodChain.id })}
            >
              Switch to Robinhood Chain
            </button>
          )}
          <button
            className="w-full rounded-sm border border-border px-3 py-1.5 text-[12px] text-muted hover:text-text"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
