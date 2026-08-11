import { isAddress, type Address } from "viem";

function addressFromEnv(name: string): Address | undefined {
  const value = process.env[name];
  return value && isAddress(value) ? value : undefined;
}

/**
 * Canonical Global Dollar (USDG, 6 decimals) on Robinhood Chain mainnet.
 * Verified against the chain explorer: ~$3.5B market cap, Paxos-issued.
 * Env can override for a fork/staging deploy, never for production.
 */
export const CANONICAL_USDG: Address =
  "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";

/**
 * Mainnet deployment manifest. Vault and engine addresses come from
 * `contracts/script/Deploy.s.sol` output. Keeping them absent disables all
 * value-moving UI — there is no demo-ledger fallback.
 */
export const hoodContracts = {
  usdg: addressFromEnv("NEXT_PUBLIC_USDG_ADDRESS") ?? CANONICAL_USDG,
  vault: addressFromEnv("NEXT_PUBLIC_VAULT_ADDRESS"),
  engine: addressFromEnv("NEXT_PUBLIC_ENGINE_ADDRESS"),
} as const;

export const isOnchainLive = Boolean(hoodContracts.vault && hoodContracts.engine);

/** Markets listed by Deploy.s.sol, in listing order. SPCX stays off-chain (no verifiable oracle). */
export const onchainMarketIds: Record<string, number | undefined> = {
  NVDA: 0,
  TSLA: 1,
  AMD: 2,
  AAPL: 3,
  META: 4,
  AMZN: 5,
  PLTR: 6,
};

export const marketSymbolById: Record<number, string> = Object.fromEntries(
  Object.entries(onchainMarketIds)
    .filter(([, id]) => id !== undefined)
    .map(([symbol, id]) => [id as number, symbol])
);

export const usdgAbi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const vaultAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "assets", type: "uint256" }],
  },
  {
    type: "function",
    name: "sharesOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalShares",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "reserved",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "sharePrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "depositCap",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const engineAbi = [
  {
    type: "function",
    name: "quote",
    stateMutability: "view",
    inputs: [
      { name: "marketId", type: "uint16" },
      { name: "leverage", type: "uint8" },
      { name: "size", type: "uint128" },
    ],
    outputs: [
      { name: "premium", type: "uint128" },
      { name: "strike", type: "uint128" },
      { name: "maxPayout", type: "uint128" },
    ],
  },
  {
    type: "function",
    name: "open",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "uint16" },
      { name: "side", type: "uint8" },
      { name: "leverage", type: "uint8" },
      { name: "expiresAt", type: "uint64" },
      { name: "size", type: "uint128" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "settle",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "positionIdsOf",
    stateMutability: "view",
    inputs: [{ name: "trader", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "positions",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "trader", type: "address" },
      { name: "marketId", type: "uint16" },
      { name: "side", type: "uint8" },
      { name: "leverage", type: "uint8" },
      { name: "openedAt", type: "uint64" },
      { name: "expiresAt", type: "uint64" },
      { name: "premium", type: "uint128" },
      { name: "strike", type: "uint128" },
      { name: "entrySpot", type: "uint128" },
      { name: "settled", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "postPrice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "uint16" },
      { name: "price", type: "uint128" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "markets",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      { name: "symbol", type: "bytes32" },
      { name: "active", type: "bool" },
      { name: "spot", type: "uint128" },
      { name: "updatedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "minSize",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint128" }],
  },
  {
    type: "function",
    name: "maxSize",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint128" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "Opened",
    anonymous: false,
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "trader", type: "address", indexed: true },
      { name: "marketId", type: "uint16", indexed: false },
      { name: "side", type: "uint8", indexed: false },
      { name: "leverage", type: "uint8", indexed: false },
      { name: "premium", type: "uint128", indexed: false },
      { name: "strike", type: "uint128", indexed: false },
      { name: "expiresAt", type: "uint64", indexed: false },
    ],
  },
] as const;
