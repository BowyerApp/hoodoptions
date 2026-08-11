"use client";

import Link from "next/link";
import { HomeHero } from "@/components/motion/HomeHero";
import { Reveal } from "@/components/motion/Reveal";
import { motion } from "framer-motion";

const PARAMS = [
  { v: "7", k: "TOKENIZED-STOCK MARKETS" },
  { v: "80%", k: "MAX POOL UTILIZATION" },
  { v: "100%", k: "PAYOUT COLLATERALIZED AT OPEN" },
  { v: "3%", k: "FEE — WINNING PAYOUTS ONLY" },
];

const STEPS = [
  {
    n: "01",
    t: "Pick the move",
    b: "Market, direction, leverage, expiry. The strike and premium are computed by the engine contract — no order book games, no slippage.",
  },
  {
    n: "02",
    t: "Premium is the whole risk",
    b: "Pay the premium in USDG. That number is the most you can ever lose. No margin calls, no funding, no liquidation price to babysit.",
  },
  {
    n: "03",
    t: "Settle on-chain",
    b: "At expiry the oracle print decides. Winning payouts are already reserved in the vault and land straight in your wallet.",
  },
];

const GUARANTEES = [
  ["Hard deposit cap", "The pilot pool has a contract-enforced ceiling. Small by design while the venue earns trust."],
  ["Collateral reserved up front", "A position cannot open unless the vault locks its full max payout first. No IOUs."],
  ["Fresh prices or no trade", "Opens are blocked if the oracle print is older than 45 minutes — nobody trades against a stale tape."],
  ["Exits are never pausable", "The pause switch stops new risk. Withdrawals and settlements cannot be frozen by anyone, including us."],
];

export default function HomePage() {
  return (
    <div>
      <HomeHero />

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-20 grid md:grid-cols-3 gap-12">
          {[
            {
              k: "DEFINED RISK",
              t: "Premium = max loss",
              b: "No liquidation price. No funding. You pay a premium for leveraged UP or DOWN on tokenized stocks until expiry.",
            },
            {
              k: "USDG VAULT",
              t: "Be the house",
              b: "Deposit USDG into the liquidity pool. Earn premiums traders pay. Withdraw available capital anytime.",
            },
            {
              k: "ROBINHOOD CHAIN",
              t: "Stock tokens & RWAs",
              b: "NVDA, TSLA, SPCX, AMD — options where the assets live. Not an ETH-first afterthought.",
            },
          ].map((card, i) => (
            <Reveal key={card.k} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <div className="font-mono text-xs text-copper tracking-widest mb-3">
                  {card.k}
                </div>
                <h2 className="text-2xl mb-3">{card.t}</h2>
                <p className="text-muted leading-relaxed">{card.b}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface/30">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-y-8">
          {PARAMS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.08}>
              <div className={i > 0 ? "lg:border-l lg:border-border lg:pl-8" : ""}>
                <div className="font-mono text-3xl text-text mb-1.5">{p.v}</div>
                <div className="font-mono text-[10.5px] tracking-[0.18em] text-muted">
                  {p.k}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-20">
          <Reveal>
            <div className="font-mono text-xs text-copper tracking-widest mb-3">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl mb-12">Three moves. Nothing hidden.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="h-full">
                <div className="bg-bg p-8 h-full">
                  <div className="font-mono text-xs text-copper mb-6">{s.n}</div>
                  <h3 className="text-xl mb-3">{s.t}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-20">
          <Reveal>
            <div className="font-mono text-xs text-copper tracking-widest mb-3">
              VS PERPS
            </div>
            <h2 className="text-3xl mb-10">Wicks don&apos;t wipe you out</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal delay={0.1}>
              <motion.div
                className="border border-border p-6 h-full"
                whileHover={{ borderColor: "rgba(232,93,76,0.4)" }}
              >
                <div className="font-mono text-xs text-down mb-4">PERPS</div>
                <pre className="font-mono text-xs text-muted leading-6 whitespace-pre-wrap">{`wick → liquidation
direction right, still wiped
funding bleeds
open-ended risk`}</pre>
              </motion.div>
            </Reveal>
            <Reveal delay={0.2}>
              <motion.div
                className="border border-copper/40 p-6 bg-copper-dim/30 h-full"
                whileHover={{ scale: 1.01 }}
              >
                <div className="font-mono text-xs text-copper mb-4">HOODOPTIONS</div>
                <pre className="font-mono text-xs text-text leading-6 whitespace-pre-wrap">{`wick → position survives
loss capped at premium
no funding
expiry settles`}</pre>
              </motion.div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <Link
                href="/docs"
                className="text-sm text-copper underline-offset-4 hover:underline"
                data-cursor
              >
                Read the docs
              </Link>
              <Link
                href="/pitch"
                className="text-sm text-muted hover:text-text"
                data-cursor
              >
                Pitch narrative →
              </Link>
              <button
                data-cursor
                className="text-sm font-mono text-muted hover:text-copper ml-auto"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Replay intro
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface/30">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-20">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
            <Reveal>
              <div>
                <div className="font-mono text-xs text-copper tracking-widest mb-3">
                  RISK ARCHITECTURE
                </div>
                <h2 className="text-3xl mb-4 max-w-sm">
                  Sized like a pilot. Built like a venue.
                </h2>
                <p className="text-muted leading-relaxed max-w-sm mb-8">
                  Every rule below is enforced by the contracts, not by a
                  promise. Read them line by line on the explorer or in the
                  open repository.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/BowyerApp/hoodoptions"
                    target="_blank"
                    rel="noreferrer"
                    data-cursor
                    className="border border-border px-4 py-2.5 text-sm text-text hover:border-copper/50 transition-colors"
                  >
                    Read the contracts ↗
                  </a>
                  <Link
                    href="/docs/risk"
                    data-cursor
                    className="border border-copper/40 bg-copper-dim px-4 py-2.5 text-sm text-copper hover:bg-copper/20 transition-colors"
                  >
                    Risk model
                  </Link>
                </div>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
              {GUARANTEES.map(([t, b], i) => (
                <Reveal key={t} delay={i * 0.08} className="h-full">
                  <div className="bg-bg p-6 h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-1 w-1 bg-copper" />
                      <h3 className="font-mono text-[12.5px] tracking-wide text-text">
                        {t}
                      </h3>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
