"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Fixed full-viewport atmosphere for every page except the home hero
 * (which renders its own, stronger version). Faint brand image plane,
 * grid lines, and a continuously redrawing copper chart.
 */
export function AmbientBackground() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
        style={{ backgroundImage: "url(/brand/hero.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/85 to-bg" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg/70" />

      {/* vertical grid lines */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-copper/[0.05]"
          style={{ left: `${12 + i * 13}%` }}
        />
      ))}

      {/* drifting particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={`p${i}`}
          className="absolute w-1 h-1 rounded-full bg-copper/30"
          style={{
            left: `${8 + i * 12}%`,
            top: `${25 + (i % 4) * 18}%`,
          }}
          animate={{ y: [0, -22 - i * 3, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* looping copper chart along the bottom */}
      <svg
        className="absolute bottom-[-4%] left-0 w-full h-[38vh] opacity-50"
        viewBox="0 0 960 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="ambientFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4a574" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#c4a574" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 C90,190 140,140 220,148 C300,156 340,90 430,100 C520,110 560,60 650,70 C740,80 800,44 880,52 C920,56 940,48 960,50 L960,240 L0,240 Z"
          fill="url(#ambientFill)"
        />
        <motion.path
          d="M0,200 C90,190 140,140 220,148 C300,156 340,90 430,100 C520,110 560,60 650,70 C740,80 800,44 880,52 C920,56 940,48 960,50"
          stroke="#c4a574"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
          transition={{
            duration: 8,
            times: [0, 0.5, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      </svg>

      {/* corner glow */}
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-copper/[0.06] blur-3xl" />
    </div>
  );
}
