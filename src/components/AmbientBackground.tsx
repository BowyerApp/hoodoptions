"use client";

import { usePathname } from "next/navigation";

/**
 * Fixed backdrop for every page except home. Pure geometry — hairline grid
 * and a single static baseline curve. No images, no particles.
 */
export function AmbientBackground() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* vertical hairlines */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={`v${i}`}
          className="absolute top-0 bottom-0 w-px bg-text/[0.025]"
          style={{ left: `${12 + i * 13}%` }}
        />
      ))}
      {/* horizontal hairlines */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`h${i}`}
          className="absolute left-0 right-0 h-px bg-text/[0.02]"
          style={{ top: `${22 + i * 20}%` }}
        />
      ))}

      {/* static baseline curve along the bottom */}
      <svg
        className="absolute bottom-0 left-0 h-[30vh] w-full opacity-40"
        viewBox="0 0 960 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,200 C90,190 140,140 220,148 C300,156 340,90 430,100 C520,110 560,60 650,70 C740,80 800,44 880,52 C920,56 940,48 960,50"
          stroke="var(--copper)"
          strokeOpacity="0.16"
          strokeWidth="1.25"
        />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-transparent to-bg/80" />
    </div>
  );
}
