import { isAddress, type Address } from "viem";

function addressFromEnv(name: string): Address | undefined {
  const value = process.env[name];
  return value && isAddress(value) ? value : undefined;
}

/**
 * Testnet deployment manifest. Set these after `contracts/script/Deploy.s.sol`
 * broadcasts successfully. Keeping addresses absent disables all value-moving
 * UI rather than falling back to the legacy demo ledger.
 */
export const hoodTestnetContracts = {
  usdg: addressFromEnv("NEXT_PUBLIC_TESTNET_USDG_ADDRESS"),
  vault: addressFromEnv("NEXT_PUBLIC_TESTNET_VAULT_ADDRESS"),
  engine: addressFromEnv("NEXT_PUBLIC_TESTNET_ENGINE_ADDRESS"),
} as const;

export const isTestnetLive = Boolean(
  hoodTestnetContracts.usdg &&
    hoodTestnetContracts.vault &&
    hoodTestnetContracts.engine
);

/** Markets deployed by Deploy.s.sol. SPCX stays off-chain until it has a verifiable oracle. */
export const onchainMarketIds: Record<string, number | undefined> = {
  NVDA: 0,
  TSLA: 1,
  AMD: 2,
  AAPL: 3,
  META: 4,
  AMZN: 5,
  PLTR: 6,
};

export const usdgAbi = [
  {
    type: "function",
    name: "faucet",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
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
