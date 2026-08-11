"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HeroVisual } from "@/components/HeroVisual";
import { LogoMark, Wordmark } from "@/components/Brand";
import { TextReveal } from "./TextReveal";

export function HomeHero() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const onDone = () => setArmed(true);
    window.addEventListener("forge-intro-done", onDone);
    // Safety net: never leave the hero unarmed if the intro was skipped/missed.
    const fallback = setTimeout(() => setArmed(true), 3600);
    return () => {
      window.removeEventListener("forge-intro-done", onDone);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-6.5rem)] flex items-center overflow-hidden">
      <HeroVisual armed={armed} />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-6 w-full py-20 md:py-28">
        <div className="max-w-xl md:max-w-lg lg:max-w-xl">
          <motion.div
            className="flex items-center gap-3 mb-10"
            initial={{ opacity: 0, y: 28 }}
            animate={armed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={
                armed
                  ? { rotate: [0, -6, 0], scale: [0.9, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoMark size={40} className="text-text" />
            </motion.div>
            <Wordmark className="text-[26px] md:text-[30px]" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl leading-[1.1] tracking-tight max-w-2xl overflow-hidden">
            {armed ? (
              <TextReveal text="Options on Robinhood stock tokens." />
            ) : (
              <span className="opacity-0">Options on Robinhood stock tokens.</span>
            )}
          </h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-muted max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={armed ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Pick the move. Max loss is the premium. Deposit USDG and earn.
            Built for RWAs on Robinhood Chain.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={armed ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.65, duration: 0.65 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/trade"
                data-cursor
                className="inline-flex items-center bg-copper text-bg px-6 py-3 text-sm font-medium tracking-wide"
              >
                Trade
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/earn"
                data-cursor
                className="inline-flex items-center border border-border-strong px-6 py-3 text-sm text-text hover:bg-copper-dim transition-colors"
              >
                Earn USDG
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
