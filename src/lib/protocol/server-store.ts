import { promises as fs } from "fs";
import path from "path";
import { MARKETS } from "@/lib/chain/robinhood";
import { quoteOption, type Side } from "@/lib/protocol/pricing";
import { fetchLivePrices } from "@/lib/prices/live";
import type { ActivityItem, Position } from "@/lib/protocol/types";

// On serverless (Vercel) the project dir is read-only — use /tmp instead.
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "forge-data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "forge-state.json");
const FAUCET = 10_000;
const SEED_VAULT = 2_450_000;
const MAX_USERS = 500;
const RATE_MS = 200;

export type UserAccount = {
  id: string;
  wallet?: string;
  usdg: number;
  lpShares: number;
  points: number;
  positions: Position[];
  history: Position[];
  createdAt: number;
  lastActive: number;
};

export type VenueState = {
  vaultAssets: number;
  vaultShares: number;
  reserved: number;
  volume24h: number;
  openInterest: number;
  prices: Record<string, number>;
  priceChanges: Record<string, number>;
  activity: ActivityItem[];
  users: Record<string, UserAccount>;
  updatedAt: number;
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function seedPrices() {
  const prices: Record<string, number> = {};
  const priceChanges: Record<string, number> = {};
  for (const m of MARKETS) {
    prices[m.symbol] = m.basePrice;
    priceChanges[m.symbol] = (Math.random() - 0.45) * 3;
  }
  return { prices, priceChanges };
}

function seedActivity(): ActivityItem[] {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => {
    const m = MARKETS[i % MARKETS.length];
    const kinds: ActivityItem["kind"][] = ["open", "settle", "deposit"];
    const kind = kinds[i % 3];
    return {
      id: uid("act"),
      kind,
      symbol: m.symbol,
      label:
        kind === "open"
          ? `${m.symbol} ${i % 2 ? "UP" : "DOWN"} opened`
          : kind === "settle"
            ? `${m.symbol} settled`
            : `USDG deposited`,
      amount: kind === "deposit" ? 2500 + i * 300 : 60 + i * 28,
      at: now - i * 55_000,
    };
  });
}

function createVenue(): VenueState {
  const { prices, priceChanges } = seedPrices();
  return {
    vaultAssets: SEED_VAULT,
    vaultShares: SEED_VAULT,
    reserved: 180_000,
    volume24h: 1_240_000,
    openInterest: 420_000,
    prices,
    priceChanges,
    activity: seedActivity(),
    users: {},
    updatedAt: Date.now(),
  };
}

type GlobalForge = {
  venue?: VenueState;
  lock?: Promise<void>;
  lastWrite?: number;
  rate?: Map<string, number>;
};

const g = globalThis as unknown as { __forge?: GlobalForge };
if (!g.__forge) g.__forge = { rate: new Map() };

async function ensureLoaded() {
  if (g.__forge!.venue) return g.__forge!.venue!;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    g.__forge!.venue = JSON.parse(raw) as VenueState;
  } catch {
    g.__forge!.venue = createVenue();
    await persist();
  }
  return g.__forge!.venue!;
}

async function persist() {
  const venue = g.__forge!.venue;
  if (!venue) return;
  venue.updatedAt = Date.now();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(venue));
    await fs.rename(tmp, DATA_FILE);
    g.__forge!.lastWrite = Date.now();
  } catch {
    // Disk persistence is best-effort; in-memory state stays authoritative.
  }
}

async function withLock<T>(fn: () => Promise<T> | T): Promise<T> {
  const prev = g.__forge!.lock ?? Promise.resolve();
  let release!: () => void;
  g.__forge!.lock = new Promise<void>((r) => {
    release = r;
  });
  await prev;
  try {
    await ensureLoaded();
    return await fn();
  } finally {
    release();
  }
}

function checkRate(userId: string) {
  const map = g.__forge!.rate!;
  const now = Date.now();
  const last = map.get(userId) ?? 0;
  if (now - last < RATE_MS) return false;
  map.set(userId, now);
  return true;
}

function sharePrice(v: VenueState) {
  return v.vaultShares > 0 ? v.vaultAssets / v.vaultShares : 1;
}

function pushActivity(v: VenueState, item: ActivityItem) {
  v.activity = [item, ...v.activity].slice(0, 60);
}

function ensureUser(v: VenueState, userId: string): UserAccount {
  let u = v.users[userId];
  if (!u) {
    if (Object.keys(v.users).length >= MAX_USERS) {
      // prune oldest inactive
      const sorted = Object.values(v.users).sort(
        (a, b) => a.lastActive - b.lastActive
      );
      for (const old of sorted.slice(0, 20)) {
        delete v.users[old.id];
      }
    }
    u = {
      id: userId,
      usdg: FAUCET,
      lpShares: 0,
      points: 100,
      positions: [],
      history: [],
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    v.users[userId] = u;
    pushActivity(v, {
      id: uid("act"),
      kind: "deposit",
      label: "New trader joined · faucet credited",
      amount: FAUCET,
      at: Date.now(),
    });
  }
  u.lastActive = Date.now();
  return u;
}

/**
 * Real quotes for public tickers; simulated walk only for private RWAs
 * (SPCX) that have no public market.
 */
async function refreshPrices(v: VenueState) {
  const live = await fetchLivePrices();
  for (const m of MARKETS) {
    const q = live[m.symbol];
    if (q) {
      v.prices[m.symbol] = q.price;
      v.priceChanges[m.symbol] = q.changePct;
    } else {
      const prev = v.prices[m.symbol] ?? m.basePrice;
      const next = Math.max(0.01, prev * (1 + (Math.random() - 0.5) * 0.0015));
      v.priceChanges[m.symbol] = ((next - m.basePrice) / m.basePrice) * 100;
      v.prices[m.symbol] = next;
    }
  }
}

function settleUser(v: VenueState, u: UserAccount) {
  const now = Date.now();
  const still: Position[] = [];
  for (const p of u.positions) {
    if (p.status !== "open" || p.expiresAt > now) {
      still.push(p);
      continue;
    }
    const spot = v.prices[p.symbol] ?? p.entrySpot;
    const won = p.side === "UP" ? spot >= p.strike : spot <= p.strike;
    const reserveNeed = p.sizeUsd * p.leverage * 0.15;
    v.reserved = Math.max(0, v.reserved - reserveNeed);
    v.openInterest = Math.max(0, v.openInterest - p.sizeUsd * p.leverage);

    if (won) {
      const payout = p.premium * (1.4 + p.leverage * 0.35);
      const net = payout * 0.97;
      v.vaultAssets = Math.max(0, v.vaultAssets - net);
      u.usdg += net;
      u.points += Math.floor(net / 5);
      const settled: Position = {
        ...p,
        status: "won",
        payout: net,
        pnl: net - p.premium,
      };
      u.history = [settled, ...u.history].slice(0, 40);
      pushActivity(v, {
        id: uid("act"),
        kind: "settle",
        symbol: p.symbol,
        label: `Won ${p.symbol} ${p.side}`,
        amount: net,
        at: now,
      });
    } else {
      const settled: Position = {
        ...p,
        status: "lost",
        payout: 0,
        pnl: -p.premium,
      };
      u.history = [settled, ...u.history].slice(0, 40);
      pushActivity(v, {
        id: uid("act"),
        kind: "settle",
        symbol: p.symbol,
        label: `Expired ${p.symbol} ${p.side}`,
        amount: p.premium,
        at: now,
      });
    }
  }
  u.positions = still;
}

function settleAll(v: VenueState) {
  for (const u of Object.values(v.users)) settleUser(v, u);
}

export function publicVenue(v: VenueState) {
  const sp = sharePrice(v);
  return {
    vaultAssets: v.vaultAssets,
    vaultShares: v.vaultShares,
    reserved: v.reserved,
    volume24h: v.volume24h,
    openInterest: v.openInterest,
    sharePrice: sp,
    utilization: v.vaultAssets > 0 ? Math.min(1, v.reserved / v.vaultAssets) : 0,
    apy: 0.08 + Math.min(1, v.reserved / v.vaultAssets) * 0.22 + v.volume24h / 50_000_000,
    prices: v.prices,
    priceChanges: v.priceChanges,
    activity: v.activity.slice(0, 30),
    traders: Object.keys(v.users).length,
    updatedAt: v.updatedAt,
  };
}

export function publicUser(v: VenueState, u: UserAccount) {
  const sp = sharePrice(v);
  const equity = u.lpShares * sp;
  const free = Math.max(0, v.vaultAssets - v.reserved);
  const availableWithdraw =
    v.vaultShares > 0 && u.lpShares > 0
      ? Math.min(equity, free * (u.lpShares / v.vaultShares))
      : 0;
  return {
    id: u.id,
    usdg: u.usdg,
    lpShares: u.lpShares,
    lpEquity: equity,
    availableWithdraw,
    points: u.points,
    positions: u.positions,
    history: u.history,
  };
}

export async function getOrCreateSession(userId?: string | null) {
  return withLock(async () => {
    const v = g.__forge!.venue!;
    await refreshPrices(v);
    settleAll(v);
    const id = userId && v.users[userId] ? userId : uid("usr");
    const u = ensureUser(v, id);
    await persist();
    return { userId: u.id, venue: publicVenue(v), user: publicUser(v, u) };
  });
}

export async function getSnapshot(userId: string) {
  return withLock(async () => {
    const v = g.__forge!.venue!;
    await refreshPrices(v);
    settleAll(v);
    const u = ensureUser(v, userId);
    // occasional ambient tape so venue feels alive
    if (Math.random() < 0.25) {
      const m = MARKETS[Math.floor(Math.random() * MARKETS.length)];
      pushActivity(v, {
        id: uid("act"),
        kind: Math.random() > 0.5 ? "open" : "deposit",
        symbol: m.symbol,
        label:
          Math.random() > 0.5
            ? `${m.symbol} flow`
            : `USDG vault deposit`,
        amount: 100 + Math.random() * 4000,
        at: Date.now(),
      });
    }
    await persist();
    return { venue: publicVenue(v), user: publicUser(v, u) };
  });
}

export async function deposit(userId: string, amount: number) {
  return withLock(async () => {
    if (!checkRate(userId)) return { ok: false as const, error: "Slow down" };
    if (!(amount > 0) || amount > 1_000_000)
      return { ok: false as const, error: "Invalid amount" };
    const v = g.__forge!.venue!;
    const u = ensureUser(v, userId);
    if (amount > u.usdg) return { ok: false as const, error: "Insufficient USDG" };
    const sp = sharePrice(v);
    const shares = amount / sp;
    u.usdg -= amount;
    u.lpShares += shares;
    v.vaultAssets += amount;
    v.vaultShares += shares;
    u.points += Math.floor(amount / 10);
    pushActivity(v, {
      id: uid("act"),
      kind: "deposit",
      label: "Deposited USDG into vault",
      amount,
      at: Date.now(),
    });
    await persist();
    return { ok: true as const, venue: publicVenue(v), user: publicUser(v, u) };
  });
}

export async function withdraw(userId: string, amount: number) {
  return withLock(async () => {
    if (!checkRate(userId)) return { ok: false as const, error: "Slow down" };
    if (!(amount > 0)) return { ok: false as const, error: "Invalid amount" };
    const v = g.__forge!.venue!;
    const u = ensureUser(v, userId);
    const me = publicUser(v, u);
    if (amount > me.availableWithdraw + 0.01)
      return { ok: false as const, error: "Exceeds available liquidity" };
    const sp = sharePrice(v);
    const shares = amount / sp;
    if (shares > u.lpShares + 1e-9)
      return { ok: false as const, error: "Not enough LP shares" };
    u.usdg += amount;
    u.lpShares = Math.max(0, u.lpShares - shares);
    v.vaultAssets -= amount;
    v.vaultShares = Math.max(0, v.vaultShares - shares);
    pushActivity(v, {
      id: uid("act"),
      kind: "withdraw",
      label: "Withdrew USDG from vault",
      amount,
      at: Date.now(),
    });
    await persist();
    return { ok: true as const, venue: publicVenue(v), user: publicUser(v, u) };
  });
}

export async function openTrade(
  userId: string,
  input: {
    symbol: string;
    side: Side;
    leverage: number;
    expiryHours: number;
    sizeUsd: number;
  }
) {
  return withLock(async () => {
    if (!checkRate(userId)) return { ok: false as const, error: "Slow down" };
    const { symbol, side, leverage, expiryHours, sizeUsd } = input;
    const market = MARKETS.find((m) => m.symbol === symbol);
    if (!market) return { ok: false as const, error: "Unknown market" };
    if (sizeUsd < 10 || sizeUsd > 50_000)
      return { ok: false as const, error: "Size must be $10–$50,000" };
    if (![2, 3, 5, 8, 10].includes(leverage))
      return { ok: false as const, error: "Invalid leverage" };
    if (![1, 8, 24, 168].includes(expiryHours))
      return { ok: false as const, error: "Invalid expiry" };

    const v = g.__forge!.venue!;
    const u = ensureUser(v, userId);
    settleUser(v, u);
    const spot = v.prices[symbol] ?? market.basePrice;
    const q = quoteOption({
      spot,
      leverage,
      expiryHours,
      side,
      sizeUsd,
      iv: market.iv,
    });
    if (q.premium > u.usdg)
      return { ok: false as const, error: "Insufficient USDG for premium" };
    const free = v.vaultAssets - v.reserved;
    const reserveNeed = q.notional * 0.15;
    if (reserveNeed > free)
      return { ok: false as const, error: "Vault utilization too high" };

    const now = Date.now();
    const position: Position = {
      id: uid("pos"),
      symbol,
      side,
      leverage,
      sizeUsd,
      premium: q.premium,
      strike: q.strike,
      entrySpot: spot,
      openedAt: now,
      expiresAt: now + expiryHours * 3600_000,
      status: "open",
    };

    u.usdg -= q.premium;
    v.vaultAssets += q.premium;
    v.reserved += reserveNeed;
    v.openInterest += q.notional;
    v.volume24h += q.premium;
    u.points += Math.floor(q.premium / 2);
    u.positions = [position, ...u.positions];
    pushActivity(v, {
      id: uid("act"),
      kind: "open",
      symbol,
      label: `Opened ${symbol} ${side} ${leverage}×`,
      amount: q.premium,
      at: now,
    });
    await persist();
    return {
      ok: true as const,
      premium: q.premium,
      position,
      venue: publicVenue(v),
      user: publicUser(v, u),
    };
  });
}

export async function claim(userId: string, positionId: string) {
  return withLock(async () => {
    if (!checkRate(userId)) return { ok: false as const, error: "Slow down" };
    const v = g.__forge!.venue!;
    const u = ensureUser(v, userId);
    const p = u.positions.find((x) => x.id === positionId);
    if (!p) return { ok: false as const, error: "Position not found" };
    p.expiresAt = Date.now() - 1;
    settleUser(v, u);
    await persist();
    return { ok: true as const, venue: publicVenue(v), user: publicUser(v, u) };
  });
}

export async function faucet(userId: string) {
  return withLock(async () => {
    if (!checkRate(userId)) return { ok: false as const, error: "Slow down" };
    const v = g.__forge!.venue!;
    const u = ensureUser(v, userId);
    if (u.usdg >= 500)
      return { ok: false as const, error: "Faucet only when balance < $500" };
    u.usdg += 2500;
    u.points += 50;
    pushActivity(v, {
      id: uid("act"),
      kind: "deposit",
      label: "Faucet top-up",
      amount: 2500,
      at: Date.now(),
    });
    await persist();
    return { ok: true as const, venue: publicVenue(v), user: publicUser(v, u) };
  });
}

export async function bindWallet(
  currentUserId: string | null,
  address: string
) {
  return withLock(async () => {
    const addr = String(address ?? "").toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(addr))
      return { ok: false as const, error: "Invalid address" };
    const v = g.__forge!.venue!;
    const walletId = `wal_${addr}`;
    let u = v.users[walletId];
    if (!u) {
      const anon =
        currentUserId && currentUserId.startsWith("usr_")
          ? v.users[currentUserId]
          : undefined;
      if (anon) {
        // First connect: carry the anonymous session's balances over.
        u = { ...anon, id: walletId, wallet: addr };
        delete v.users[currentUserId!];
        v.users[walletId] = u;
      } else {
        u = ensureUser(v, walletId);
        u.wallet = addr;
      }
      pushActivity(v, {
        id: uid("act"),
        kind: "deposit",
        label: `Wallet ${addr.slice(0, 6)}…${addr.slice(-4)} connected`,
        amount: 0,
        at: Date.now(),
      });
    }
    u.lastActive = Date.now();
    await persist();
    return {
      ok: true as const,
      userId: walletId,
      venue: publicVenue(v),
      user: publicUser(v, u),
    };
  });
}

export async function health() {
  const v = await ensureLoaded();
  return {
    ok: true,
    traders: Object.keys(v.users).length,
    vaultAssets: v.vaultAssets,
    updatedAt: v.updatedAt,
    mode: "live-demo",
    chain: "robinhood",
  };
}
