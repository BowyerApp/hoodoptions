export const ROBINHOOD_CHAIN = {
  id: 4663,
  name: "Robinhood Chain",
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  explorer: "https://robinhoodchain.blockscout.com",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
} as const;

export const USDG = {
  symbol: "USDG",
  name: "Global Dollar",
  decimals: 6,
  /** Canonical Paxos-issued USDG on Robinhood Chain mainnet. */
  address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
} as const;

export type Market = {
  symbol: string;
  name: string;
  kind: "stock" | "rwa";
  basePrice: number;
  iv: number;
  address: string;
};

export const MARKETS: Market[] = [
  { symbol: "NVDA", name: "NVIDIA", kind: "stock", basePrice: 128.4, iv: 0.42, address: "0xNVDA0000000000000000000000000000000001" },
  { symbol: "TSLA", name: "Tesla", kind: "stock", basePrice: 248.2, iv: 0.55, address: "0xTSLA0000000000000000000000000000000001" },
  { symbol: "SPCX", name: "SpaceX Token", kind: "rwa", basePrice: 134.8, iv: 0.48, address: "0xSPCX0000000000000000000000000000000001" },
  { symbol: "AMD", name: "AMD", kind: "stock", basePrice: 162.1, iv: 0.44, address: "0xAMD00000000000000000000000000000000001" },
  { symbol: "AAPL", name: "Apple", kind: "stock", basePrice: 214.6, iv: 0.28, address: "0xAAPL0000000000000000000000000000000001" },
  { symbol: "META", name: "Meta", kind: "stock", basePrice: 582.3, iv: 0.36, address: "0xMETA0000000000000000000000000000000001" },
  { symbol: "AMZN", name: "Amazon", kind: "stock", basePrice: 198.7, iv: 0.34, address: "0xAMZN0000000000000000000000000000000001" },
  { symbol: "PLTR", name: "Palantir", kind: "stock", basePrice: 72.4, iv: 0.58, address: "0xPLTR0000000000000000000000000000000001" },
];

export function getMarket(symbol: string) {
  return MARKETS.find((m) => m.symbol === symbol) ?? MARKETS[0];
}
