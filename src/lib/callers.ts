import type { Side } from "@/lib/protocol/pricing";

export const CALLERS = [
  {
    id: "c1",
    name: "Lattice",
    style: "NVDA momentum · 24H",
    winRate: 0.62,
    pnl30d: 18420,
    symbol: "NVDA",
    side: "UP" as Side,
    leverage: 5,
    expiryHours: 24,
  },
  {
    id: "c2",
    name: "Copper Desk",
    style: "SPCX event weeks",
    winRate: 0.58,
    pnl30d: 12110,
    symbol: "SPCX",
    side: "UP" as Side,
    leverage: 3,
    expiryHours: 24 * 7,
  },
  {
    id: "c3",
    name: "Hedge Row",
    style: "TSLA mean-revert",
    winRate: 0.55,
    pnl30d: 8340,
    symbol: "TSLA",
    side: "DOWN" as Side,
    leverage: 3,
    expiryHours: 8,
  },
];
