"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Brand";

const WORD = "HOODOPTIONS";
const HOLD_MS = 2200;
const EXIT_MS = 750;

/**
 * Preloader entrance — plays on every homepage load.
 * Logo draw → wordmark rise → progress line → full panel wipe up.
 * Click anywhere to skip.
 */
export function IntroOverlay() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"show" | "exit" | "done">(() =>
    pathname === "/" ? "show" : "done"
  );
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    document.documentElement.classList.remove("forge-intro-lock");
    setPhase("done");
    window.dispatchEvent(new Event("forge-intro-done"));
  };

  useEffect(() => {
    if (phase === "done") {
      // Not on home (or already finished) — arm the page immediately.
      window.dispatchEvent(new Event("forge-intro-done"));
      return;
    }
    document.documentElement.classList.add("forge-intro-lock");
    const t = setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("forge-intro-lock");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(finish, EXIT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-bg cursor-pointer"
      initial={{ y: 0 }}
      animate={phase === "exit" ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
      onClick={() => setPhase("exit")}
    >
      {/* faint grid */}
      <div className="pointer-events-none absolute inset-0 price-lattice opacity-60" />

      <motion.div
        className="relative flex flex-col items-center px-6"
        animate={phase === "exit" ? { opacity: 0, y: -24 } : { opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {/* logo mark draws itself */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg width={64} height={64} viewBox="0 0 32 32" fill="none">
            <motion.path
              d="M4 25 L12.5 15.5 L17 19.5 L27 8.5"
              stroke="#c4a574"
              strokeWidth="2.4"
              strokeLinecap="square"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            />
            <motion.path
              d="M19.5 7.5 H27.5 V15.5"
              stroke="#c4a574"
              strokeWidth="2.4"
              strokeLinecap="square"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.95 }}
            />
          </svg>
        </motion.div>

        {/* wordmark letters rise */}
        <div className="mt-6 overflow-hidden">
          <div className="flex text-[11vw] md:text-6xl lg:text-7xl font-medium tracking-[-0.03em] leading-none select-none">
            {WORD.split("").map((ch, i) => (
              <motion.span
                key={i}
                className={i >= 4 ? "text-copper" : "text-text"}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.65,
                  delay: 0.25 + i * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-4 font-mono text-[10px] md:text-xs tracking-[0.4em] text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          RWA OPTIONS · ROBINHOOD CHAIN
        </motion.div>

        {/* progress line */}
        <div className="mt-10 h-px w-56 md:w-72 bg-border overflow-hidden">
          <motion.div
            className="h-full bg-copper origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: (HOLD_MS - 200) / 1000, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>

      {/* copper edge that leads the wipe */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-copper"
        initial={{ opacity: 0 }}
        animate={phase === "exit" ? { opacity: 1 } : { opacity: 0 }}
      />
    </motion.div>
  );
}
