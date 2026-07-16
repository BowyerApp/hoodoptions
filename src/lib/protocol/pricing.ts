/** Black-Scholes helpers for demo quotes */

function normCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function normPdf(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export type Side = "UP" | "DOWN";

export type QuoteInput = {
  spot: number;
  leverage: number;
  expiryHours: number;
  side: Side;
  sizeUsd: number;
  iv: number;
};

export type Quote = {
  premium: number;
  maxLoss: number;
  breakeven: number;
  strike: number;
  delta: number;
  theta: number;
  notional: number;
  payoffMultipliers: { x2: number; x5: number; x10: number };
};

export function quoteOption(input: QuoteInput): Quote {
  const { spot, leverage, expiryHours, side, sizeUsd, iv } = input;
  const T = Math.max(expiryHours / (365 * 24), 1 / (365 * 24));
  const r = 0.03;
  const move = 1 / leverage;
  const strike = side === "UP" ? spot * (1 + move * 0.35) : spot * (1 - move * 0.35);
  const sigma = Math.max(iv, 0.15);
  const d1 =
    (Math.log(spot / strike) + (r + 0.5 * sigma * sigma) * T) /
    (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const call = spot * normCdf(d1) - strike * Math.exp(-r * T) * normCdf(d2);
  const put = strike * Math.exp(-r * T) * normCdf(-d2) - spot * normCdf(-d1);
  const unitPremium = Math.max(side === "UP" ? call : put, spot * 0.002);
  const leveragedPremium = unitPremium * (leverage / 3.5);
  const contracts = sizeUsd / spot;
  const premium = Math.max(leveragedPremium * contracts * 100, 1);
  const fee = premium * 0.01;
  const totalPremium = premium + fee;

  const delta = side === "UP" ? normCdf(d1) : -normCdf(-d1);
  const thetaRaw =
    (-(spot * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) -
      (side === "UP"
        ? -r * strike * Math.exp(-r * T) * normCdf(d2)
        : r * strike * Math.exp(-r * T) * normCdf(-d2))) /
    365;

  const breakeven =
    side === "UP"
      ? strike + totalPremium / (contracts * 100 || 1)
      : strike - totalPremium / (contracts * 100 || 1);

  const payoutAt = (mult: number) => {
    const target = side === "UP" ? spot * mult : spot / mult;
    const intrinsic =
      side === "UP"
        ? Math.max(0, target - strike)
        : Math.max(0, strike - target);
    return Math.max(0, intrinsic * contracts * 100 - fee);
  };

  return {
    premium: round2(totalPremium),
    maxLoss: round2(totalPremium),
    breakeven: round2(breakeven),
    strike: round2(strike),
    delta: round3(delta * leverage * 0.25),
    theta: round3(thetaRaw * contracts),
    notional: round2(sizeUsd * leverage),
    payoffMultipliers: {
      x2: round2(payoutAt(1.02 * (1 + 1 / leverage))),
      x5: round2(payoutAt(1.05 * (1 + 1 / leverage))),
      x10: round2(payoutAt(1.1 * (1 + 1 / leverage))),
    },
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

export const EXPIRIES = [
  { label: "1H", hours: 1 },
  { label: "8H", hours: 8 },
  { label: "24H", hours: 24 },
  { label: "7D", hours: 24 * 7 },
] as const;

export const LEVERAGES = [2, 3, 5, 8, 10] as const;
