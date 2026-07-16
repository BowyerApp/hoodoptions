"use client";

import { ActivityFeed } from "@/components/ActivityFeed";
import { formatUsd, useForge } from "@/store/forge";

export default function ActivityPage() {
  const venue = useForge((s) => s.venue);

  return (
    <div className="mx-auto max-w-[900px] px-4 md:px-6 py-10">
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        VENUE TAPE
      </div>
      <h1 className="text-4xl mb-2">Live activity</h1>
      <p className="text-muted mb-8">
        Shared across all traders · TVL {formatUsd(venue?.vaultAssets ?? 0, 0)} ·{" "}
        {venue?.traders ?? 0} sessions
      </p>
      <div className="border border-border p-4">
        <ActivityFeed limit={40} />
      </div>
    </div>
  );
}
