"use client";

import Link from "next/link";
import { LogoMark } from "@/components/Brand";
import { HomeHero } from "@/components/motion/HomeHero";
import { Reveal } from "@/components/motion/Reveal";
import { motion } from "framer-motion";

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

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 flex flex-wrap gap-6 justify-between text-sm text-muted">
          <div className="flex items-center gap-2">
            <LogoMark size={18} />
            <span>HoodOptions · hoodoptions.xyz · Robinhood Chain</span>
          </div>
          <div className="flex gap-6 font-mono text-xs">
            <Link href="/docs">Docs</Link>
            <Link href="/trade">Trade</Link>
            <Link href="/earn">Earn</Link>
            <Link href="/api/markets">API</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
