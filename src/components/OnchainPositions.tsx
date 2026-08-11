"use client";

import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import {
  engineAbi,
  hoodContracts,
  isOnchainLive,
  marketSymbolById,
} from "@/lib/chain/contracts";
import { robinhoodChain } from "@/lib/chain/wagmi";
import { txErrorToast, txSuccessToast } from "@/lib/txToast";

const engineContract = {
  address: hoodContracts.engine,
  abi: engineAbi,
  chainId: robinhoodChain.id,
} as const;

type Row = {
  id: bigint;
  marketId: number;
  side: "UP" | "DOWN";
  leverage: number;
  openedAt: number;
  expiresAt: number;
  premium: bigint;
  strike: bigint;
  entrySpot: bigint;
  settled: boolean;
};

function usd6(v: bigint) {
  return `$${Number(formatUnits(v, 6)).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

function px8(v: bigint) {
  return `$${Number(formatUnits(v, 8)).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

/** Live on-chain blotter: every position is read from the engine contract. */
export function OnchainPositions() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: robinhoodChain.id });
  const { writeContractAsync } = useWriteContract();
  const [settling, setSettling] = useState<bigint | null>(null);
  const [status, setStatus] = useState("");

  const ids = useReadContract({
    ...engineContract,
    functionName: "positionIdsOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && isOnchainLive), refetchInterval: 15_000 },
  });

  const positionReads = useReadContracts({
    contracts: (ids.data ?? []).map((id) => ({
      ...engineContract,
      functionName: "positions" as const,
      args: [id] as const,
    })),
    query: { enabled: (ids.data ?? []).length > 0, refetchInterval: 15_000 },
  });

  const marketIdsUsed = useMemo(() => {
    const set = new Set<number>();
    for (const read of positionReads.data ?? []) {
      if (read.status === "success") set.add(Number((read.result as unknown[])[1]));
    }
    return [...set];
  }, [positionReads.data]);

  const marketReads = useReadContracts({
    contracts: marketIdsUsed.map((id) => ({
      ...engineContract,
      functionName: "markets" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: marketIdsUsed.length > 0, refetchInterval: 15_000 },
  });

  const markets = useMemo(() => {
    const map = new Map<number, { spot: bigint; updatedAt: number }>();
    marketIdsUsed.forEach((id, i) => {
      const read = marketReads.data?.[i];
      if (read?.status === "success") {
        const [, , spot, updatedAt] = read.result as [string, boolean, bigint, bigint];
        map.set(id, { spot, updatedAt: Number(updatedAt) });
      }
    });
    return map;
  }, [marketIdsUsed, marketReads.data]);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];
    (ids.data ?? []).forEach((id, i) => {
      const read = positionReads.data?.[i];
      if (read?.status !== "success") return;
      const [, marketId, side, leverage, openedAt, expiresAt, premium, strike, entrySpot, settled] =
        read.result as [string, number, number, number, bigint, bigint, bigint, bigint, bigint, boolean];
      list.push({
        id,
        marketId: Number(marketId),
        side: side === 0 ? "UP" : "DOWN",
        leverage: Number(leverage),
        openedAt: Number(openedAt),
        expiresAt: Number(expiresAt),
        premium,
        strike,
        entrySpot,
        settled,
      });
    });
    return list.sort((a, b) => b.openedAt - a.openedAt);
  }, [ids.data, positionReads.data]);

  const settle = async (row: Row) => {
    if (!publicClient) return;
    if (chainId !== robinhoodChain.id) {
      setStatus("Switch your wallet to Robinhood Chain to settle.");
      return;
    }
    setSettling(row.id);
    setStatus("Confirm settlement in your wallet…");
    try {
      const hash = await writeContractAsync({
        ...engineContract,
        address: hoodContracts.engine!,
        functionName: "settle",
        args: [row.id],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Position settled on-chain. Payouts land directly in your wallet.");
      txSuccessToast(
        "Position settled",
        hash,
        "Any payout landed directly in your wallet"
      );
      await ids.refetch();
      await positionReads.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Settlement failed";
      setStatus(message.length > 140 ? `${message.slice(0, 137)}…` : message);
      txErrorToast(message);
    } finally {
      setSettling(null);
    }
  };

  if (!isOnchainLive) return null;

  if (!address) {
    return (
      <div className="border border-border px-4 py-8 text-sm text-muted mb-12">
        Connect a wallet to see your on-chain positions.
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const open = rows.filter((r) => !r.settled);
  const settled = rows.filter((r) => r.settled);

  return (
    <div className="mb-12">
      {status && (
        <p className="mb-4 border border-copper/30 bg-copper-dim px-3 py-2 text-xs text-muted">
          {status}
        </p>
      )}

      <h2 className="font-mono text-xs text-muted tracking-widest mb-3">
        ON-CHAIN POSITIONS
      </h2>
      <div className="border border-border overflow-x-auto mb-10">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted font-mono border-b border-border">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Lev</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Strike</th>
              <th className="px-4 py-3">Oracle mark</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {open.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-muted">
                  No open on-chain positions —{" "}
                  <a href="/trade" className="text-copper">
                    open a trade
                  </a>
                </td>
              </tr>
            )}
            {open.map((r) => {
              const market = markets.get(r.marketId);
              const expired = now >= r.expiresAt;
              const oracleReady = market ? market.updatedAt >= r.expiresAt : false;
              const winning = market
                ? r.side === "UP"
                  ? market.spot >= r.strike
                  : market.spot <= r.strike
                : false;
              const minsLeft = Math.max(0, Math.round((r.expiresAt - now) / 60));
              return (
                <tr key={String(r.id)} className="border-b border-border">
                  <td className="px-4 py-3 font-mono">
                    {marketSymbolById[r.marketId] ?? `#${r.marketId}`}
                  </td>
                  <td
                    className={`px-4 py-3 font-mono ${r.side === "UP" ? "text-up" : "text-down"}`}
                  >
                    {r.side}
                  </td>
                  <td className="px-4 py-3 font-mono">{r.leverage}×</td>
                  <td className="px-4 py-3 font-mono">{usd6(r.premium)}</td>
                  <td className="px-4 py-3 font-mono">{px8(r.strike)}</td>
                  <td className="px-4 py-3 font-mono">
                    {market ? px8(market.spot) : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {!expired ? (
                      <span className="text-muted">{minsLeft}m left</span>
                    ) : oracleReady ? (
                      <span className={winning ? "text-up" : "text-down"}>
                        {winning ? "IN THE MONEY" : "OUT OF THE MONEY"}
                      </span>
                    ) : (
                      <span className="text-muted">awaiting oracle print</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      data-cursor
                      disabled={!expired || !oracleReady || settling === r.id}
                      onClick={() => settle(r)}
                      className="text-xs font-mono text-copper border border-copper/40 px-2 py-1 hover:bg-copper-dim disabled:opacity-40"
                    >
                      {settling === r.id ? "Settling…" : "Settle"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="font-mono text-xs text-muted tracking-widest mb-3">
        SETTLED
      </h2>
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted font-mono border-b border-border">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Strike</th>
              <th className="px-4 py-3">Opened</th>
            </tr>
          </thead>
          <tbody>
            {settled.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  Settled positions appear here
                </td>
              </tr>
            )}
            {settled.map((r) => (
              <tr key={String(r.id)} className="border-b border-border">
                <td className="px-4 py-3 font-mono">
                  {marketSymbolById[r.marketId] ?? `#${r.marketId}`}
                </td>
                <td
                  className={`px-4 py-3 font-mono ${r.side === "UP" ? "text-up" : "text-down"}`}
                >
                  {r.side}
                </td>
                <td className="px-4 py-3 font-mono">{usd6(r.premium)}</td>
                <td className="px-4 py-3 font-mono">{px8(r.strike)}</td>
                <td className="px-4 py-3 font-mono text-muted">
                  {new Date(r.openedAt * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
