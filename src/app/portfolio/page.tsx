"use client";

import { OnchainPositions } from "@/components/OnchainPositions";
import { isOnchainLive } from "@/lib/chain/contracts";

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-copper tracking-widest mb-3">
            BLOTTER · ROBINHOOD CHAIN
          </div>
          <h1 className="text-4xl">Portfolio</h1>
        </div>
      </div>

      {isOnchainLive ? (
        <OnchainPositions />
      ) : (
        <div className="border border-border px-4 py-10 text-sm text-muted">
          The mainnet deployment is being finalized. Positions will appear here
          the moment contracts go live.
        </div>
      )}
    </div>
  );
}
