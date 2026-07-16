import type { Side } from "./pricing";

export type Position = {
  id: string;
  symbol: string;
  side: Side;
  leverage: number;
  sizeUsd: number;
  premium: number;
  strike: number;
  entrySpot: number;
  openedAt: number;
  expiresAt: number;
  status: "open" | "won" | "lost" | "claimed";
  payout?: number;
  pnl?: number;
};

export type ActivityItem = {
  id: string;
  kind: "open" | "settle" | "deposit" | "withdraw" | "copy";
  label: string;
  amount?: number;
  at: number;
  symbol?: string;
};

export type Caller = {
  id: string;
  name: string;
  style: string;
  winRate: number;
  pnl30d: number;
  symbol: string;
  side: Side;
  leverage: number;
  expiryHours: number;
};

export type ProtocolState = {
  usdg: number;
  lpShares: number;
  vaultAssets: number;
  vaultShares: number;
  reserved: number;
  points: number;
  volume24h: number;
  openInterest: number;
  positions: Position[];
  history: Position[];
  activity: ActivityItem[];
  prices: Record<string, number>;
  priceChanges: Record<string, number>;
  seeded: boolean;
};
