"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { formatUsd, useForge } from "@/store/forge";
import { LogoMark, Wordmark } from "@/components/Brand";
import { WalletButton } from "@/components/WalletButton";
import clsx from "clsx";

const LINKS = [
  { href: "/trade", label: "Trade" },
  { href: "/board", label: "Board" },
  { href: "/earn", label: "Earn" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/docs", label: "Docs" },
];

const MENU_ONLY = [
  { href: "/callers", label: "Callers" },
  { href: "/activity", label: "Activity" },
  { href: "/pitch", label: "Pitch" },
];

export function Nav() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const user = useForge((s) => s.user);
  const ready = useForge((s) => s.ready);
  const faucet = useForge((s) => s.faucet);

  const usdg = user?.usdg ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="flex h-14 items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 mr-8"
            data-cursor
          >
            <LogoMark size={24} />
            <Wordmark className="text-[17px] font-medium" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => {
              const active = path === l.href || path.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-cursor
                  className={clsx(
                    "relative px-3.5 py-2 text-[13px] font-medium transition-colors",
                    active ? "text-text" : "text-muted hover:text-text"
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute left-3.5 right-3.5 -bottom-[15px] h-[2px] bg-copper" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
              </span>
              LIVE
            </span>

            <span className="hidden sm:inline font-mono text-[13px] tabular-nums">
              <span className="text-muted">USDG&nbsp;</span>
              {ready ? formatUsd(usdg) : "—"}
            </span>

            {usdg < 500 && (
              <button
                data-cursor
                className="hidden sm:inline-flex items-center rounded-sm border border-border-strong px-3 py-1.5 text-[12px] font-mono text-copper hover:bg-copper-dim transition-colors"
                onClick={async () => {
                  const r = await faucet();
                  alert(
                    r.ok
                      ? "Faucet +$2,500 USDG"
                      : r.error || "Faucet unavailable"
                  );
                }}
              >
                Get USDG
              </button>
            )}

            <span className="hidden sm:block">
              <WalletButton />
            </span>

            <button
              className="lg:hidden text-sm text-muted"
              onClick={() => setMenu((v) => !v)}
              data-cursor
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      {menu && (
        <div className="lg:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-2">
          {[...LINKS, ...MENU_ONLY].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenu(false)}
              className="py-2 text-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
