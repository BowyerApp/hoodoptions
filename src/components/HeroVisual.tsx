"use client";

import { motion } from "framer-motion";

/** Full-bleed hero atmosphere — image plane + living copper chart */
export function HeroVisual({ armed = true }: { armed?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/brand/hero.png)" }}
        initial={{ scale: 1.12, opacity: 0 }}
        animate={armed ? { scale: 1.05, opacity: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/50" />

      {/* floating particles */}
      {armed &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-copper/40"
            style={{
              left: `${55 + (i % 6) * 7}%`,
              top: `${20 + Math.floor(i / 6) * 35}%`,
            }}
            animate={{
              y: [0, -18 - i * 2, 0],
              opacity: [0.15, 0.7, 0.15],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

      <svg
        className="absolute right-[-2%] top-[18%] w-[62%] max-w-[820px] h-auto opacity-80 hidden md:block"
        viewBox="0 0 480 220"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4a574" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c4a574" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,180 C60,170 90,120 140,125 C190,130 210,70 260,78 C310,86 330,40 380,48 C420,54 450,30 480,36 L480,220 L0,220 Z"
          fill="url(#heroFill)"
          initial={{ opacity: 0 }}
          animate={armed ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, delay: 0.2 }}
        />
        <motion.path
          d="M0,180 C60,170 90,120 140,125 C190,130 210,70 260,78 C310,86 330,40 380,48 C420,54 450,30 480,36"
          stroke="#c4a574"
          strokeWidth="1.75"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={
            armed
              ? { pathLength: [0, 1, 1], opacity: [1, 1, 0] }
              : {}
          }
          transition={{
            duration: 6,
            times: [0, 0.45, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.4,
            delay: 0.15,
          }}
        />
        <motion.circle
          cx="480"
          cy="36"
          r="5"
          fill="#c4a574"
          initial={{ scale: 0 }}
          animate={
            armed
              ? { scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }
              : {}
          }
          transition={{ duration: 2.2, repeat: Infinity, delay: 2 }}
        />
      </svg>

      <motion.div
        className="absolute right-[10%] bottom-[22%] hidden lg:block font-mono text-[11px] tracking-widest text-copper/90"
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={
          armed
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : {}
        }
        transition={{ delay: 0.9, duration: 0.7 }}
      >
        <div>NVDA · ROBINHOOD CHAIN</div>
        <motion.div
          className="mt-2 text-3xl tracking-normal text-text"
          animate={armed ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          UP 5×
        </motion.div>
        <div className="mt-1 text-muted normal-case tracking-normal">
          max loss = premium
        </div>
      </motion.div>
    </div>
  );
}
