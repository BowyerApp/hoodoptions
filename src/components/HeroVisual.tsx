"use client";

import { motion } from "framer-motion";

/**
 * Code-drawn hero backdrop: hairline grid, a single price path with a live
 * endpoint, and a right-edge price axis. No image assets — everything is
 * deterministic geometry so it reads as a terminal, not artwork.
 */

// Deterministic walk (viewBox y-coords, lower = higher price).
const WALK = [
  186, 182, 184, 177, 179, 172, 175, 167, 170, 161, 165, 156, 160, 151, 155,
  158, 148, 142, 146, 137, 141, 131, 136, 126, 131, 121, 126, 115, 120, 109,
  114, 103, 108, 97, 102, 91, 96, 84, 89, 77, 82, 70, 75, 63, 68, 56, 61, 49,
];

const W = 640;
const H = 240;
const STEP = W / (WALK.length - 1);

const linePath = WALK.map(
  (y, i) => `${i === 0 ? "M" : "L"}${(i * STEP).toFixed(1)},${y}`
).join(" ");
const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

const AXIS = [
  { y: 52, label: "215.00" },
  { y: 96, label: "200.00" },
  { y: 140, label: "185.00" },
  { y: 184, label: "170.00" },
];

export function HeroVisual({ armed = true }: { armed?: boolean }) {
  const endX = W;
  const endY = WALK[WALK.length - 1];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* vertical hairlines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`v${i}`}
          className="absolute top-0 bottom-0 w-px bg-text/[0.03]"
          style={{ left: `${10 + i * 11.5}%` }}
        />
      ))}

      {/* chart plane, right side */}
      <motion.svg
        className="absolute right-0 top-[14%] hidden h-auto w-[60%] max-w-[880px] md:block"
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={armed ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {AXIS.map((a) => (
          <g key={a.y}>
            <line
              x1="0"
              x2={W}
              y1={a.y}
              y2={a.y}
              stroke="var(--text)"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
            <text
              x={W - 6}
              y={a.y - 5}
              textAnchor="end"
              fill="var(--muted)"
              fillOpacity="0.5"
              fontSize="9"
              fontFamily="var(--font-plex), monospace"
            >
              {a.label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="var(--copper)" fillOpacity="0.05" />
        <motion.path
          d={linePath}
          stroke="var(--copper)"
          strokeOpacity="0.85"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={armed ? { pathLength: 1 } : {}}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />

        {/* last-price marker */}
        <line
          x1="0"
          x2={W}
          y1={endY}
          y2={endY}
          stroke="var(--copper)"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <motion.circle
          cx={endX}
          cy={endY}
          r="3"
          fill="var(--copper)"
          initial={{ opacity: 0 }}
          animate={armed ? { opacity: [1, 0.45, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: 2.6 }}
        />
      </motion.svg>

      {/* readability fades over the chart */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />

      {/* order-ticket caption */}
      <motion.div
        className="absolute right-[9%] bottom-[20%] hidden border-l border-copper/40 pl-4 font-mono lg:block"
        initial={{ opacity: 0, y: 12 }}
        animate={armed ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <div className="text-[10px] tracking-[0.25em] text-muted">
          NVDA · ROBINHOOD CHAIN
        </div>
        <div className="mt-2 text-2xl text-text">UP 5×</div>
        <div className="mt-1 text-[11px] text-muted">max loss = premium</div>
      </motion.div>
    </div>
  );
}
