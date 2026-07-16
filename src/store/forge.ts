"use client";

import { create } from "zustand";
import type { ActivityItem, Position } from "@/lib/protocol/types";
import type { Side } from "@/lib/protocol/pricing";
import { CALLERS as CALLER_SEED } from "@/lib/callers";

type Venue = {
  vaultAssets: number;
  vaultShares: number;
  reserved: number;
  volume24h: number;
  openInterest: number;
  sharePrice: number;
  utilization: number;
  apy: number;
  prices: Record<string, number>;
  priceChanges: Record<string, number>;
  activity: ActivityItem[];
  traders: number;
  updatedAt: number;
};

type User = {
  id: string;
  usdg: number;
  lpShares: number;
  lpEquity: number;
  availableWithdraw: number;
  points: number;
  positions: Position[];
  history: Position[];
};

type ForgeStore = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  userId: string | null;
  venue: Venue | null;
  user: User | null;
  hydrate: () => Promise<void>;
  apply: (data: { venue?: Venue; user?: User; userId?: string }) => void;
  deposit: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  withdraw: (amount: number) => Promise<{ ok: boolean; error?: string }>;
  openTrade: (input: {
    symbol: string;
    side: Side;
    leverage: number;
    expiryHours: number;
    sizeUsd: number;
  }) => Promise<{ ok: boolean; error?: string; premium?: number }>;
  claim: (positionId: string) => Promise<{ ok: boolean; error?: string }>;
  faucet: () => Promise<{ ok: boolean; error?: string }>;
  bindWallet: (address: string) => Promise<{ ok: boolean; error?: string }>;
};

const emptyVenue: Venue = {
  vaultAssets: 0,
  vaultShares: 0,
  reserved: 0,
  volume24h: 0,
  openInterest: 0,
  sharePrice: 1,
  utilization: 0,
  apy: 0,
  prices: {},
  priceChanges: {},
  activity: [],
  traders: 0,
  updatedAt: 0,
};

const emptyUser: User = {
  id: "",
  usdg: 0,
  lpShares: 0,
  lpEquity: 0,
  availableWithdraw: 0,
  points: 0,
  positions: [],
  history: [],
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok && data?.ok === false) return data;
  return data;
}

export const useForge = create<ForgeStore>((set, get) => ({
  ready: false,
  loading: false,
  error: null,
  userId: null,
  venue: null,
  user: null,

  apply: (data) => {
    set((s) => ({
      ready: true,
      loading: false,
      error: null,
      userId: data.userId ?? s.userId,
      venue: data.venue ?? s.venue,
      user: data.user ?? s.user,
    }));
  },

  hydrate: async () => {
    try {
      set({ loading: true, error: null });
      const data = await api<{
        userId: string;
        venue: Venue;
        user: User;
      }>("/api/state");
      get().apply(data);
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to connect",
        ready: false,
      });
    }
  },

  deposit: async (amount) => {
    const data = await api<{
      ok: boolean;
      error?: string;
      venue?: Venue;
      user?: User;
    }>("/api/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    if (data.ok && data.venue && data.user) get().apply(data);
    return { ok: !!data.ok, error: data.error };
  },

  withdraw: async (amount) => {
    const data = await api<{
      ok: boolean;
      error?: string;
      venue?: Venue;
      user?: User;
    }>("/api/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    if (data.ok && data.venue && data.user) get().apply(data);
    return { ok: !!data.ok, error: data.error };
  },

  openTrade: async (input) => {
    const data = await api<{
      ok: boolean;
      error?: string;
      premium?: number;
      venue?: Venue;
      user?: User;
    }>("/api/trade", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (data.ok && data.venue && data.user) get().apply(data);
    return { ok: !!data.ok, error: data.error, premium: data.premium };
  },

  claim: async (positionId) => {
    const data = await api<{
      ok: boolean;
      error?: string;
      venue?: Venue;
      user?: User;
    }>("/api/claim", {
      method: "POST",
      body: JSON.stringify({ positionId }),
    });
    if (data.ok && data.venue && data.user) get().apply(data);
    return { ok: !!data.ok, error: data.error };
  },

  faucet: async () => {
    const data = await api<{
      ok: boolean;
      error?: string;
      venue?: Venue;
      user?: User;
    }>("/api/faucet", { method: "POST" });
    if (data.ok && data.venue && data.user) get().apply(data);
    return { ok: !!data.ok, error: data.error };
  },

  bindWallet: async (address) => {
    const data = await api<{
      ok: boolean;
      error?: string;
      userId?: string;
      venue?: Venue;
      user?: User;
    }>("/api/wallet", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
    if (data.ok && data.venue && data.user) get().apply(data);
    return { ok: !!data.ok, error: data.error };
  },
}));

export const CALLERS = CALLER_SEED;

export function formatUsd(n: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(n || 0);
}

export function formatPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${(n || 0).toFixed(2)}%`;
}

/** Selectors used across UI */
export function useVenue() {
  return useForge((s) => s.venue) ?? emptyVenue;
}

export function useUser() {
  return useForge((s) => s.user) ?? emptyUser;
}
