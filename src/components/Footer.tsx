"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/Brand";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "PRODUCT",
    links: [
      { label: "Trade", href: "/trade" },
      { label: "Earn USDG", href: "/earn" },
      { label: "Board", href: "/board" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "How it works", href: "/docs/how-it-works" },
      { label: "Risk model", href: "/docs/risk" },
      { label: "GitHub", href: "https://github.com/BowyerApp/hoodoptions", external: true },
    ],
  },
  {
    title: "CHAIN",
    links: [
      { label: "Explorer", href: "https://robinhoodchain.blockscout.com", external: true },
      {
        label: "Bridge",
        href: "https://portal.arbitrum.io/bridge?destinationChain=robinhood-chain",
        external: true,
      },
      {
        label: "USDG token",
        href: "https://robinhoodchain.blockscout.com/token/0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
        external: true,
      },
      { label: "Why Robinhood Chain", href: "/docs/why-robinhood-chain" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/pitch") return null;

  return (
    <footer className="relative z-10 border-t border-border mt-24">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <LogoMark size={20} className="text-text" />
            <Wordmark className="text-[13px]" />
          </div>
          <p className="text-sm text-muted max-w-[300px] leading-relaxed mb-5">
            Defined-risk options on tokenized stocks. Premium in, payout out —
            nothing to liquidate, ever.
          </p>
          <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[11px] text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
            </span>
            ROBINHOOD CHAIN · ID 4663
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="font-mono text-[11px] tracking-[0.2em] text-muted mb-4">
              {col.title}
            </div>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) =>
                l.external ? (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor
                      className="text-muted hover:text-text transition-colors"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      data-cursor
                      className="text-muted hover:text-text transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted">
          <span>© 2026 HoodOptions · hoodoptions.xyz</span>
          <span>
            Options involve risk. Pilot pool is deliberately capped. Not
            investment advice.
          </span>
        </div>
      </div>
    </footer>
  );
}
