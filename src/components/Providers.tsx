"use client";

import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ForgeCursor } from "./ForgeCursor";
import { CommandPalette } from "./CommandPalette";
import { IntroOverlay } from "./motion/IntroOverlay";
import { wagmiConfig } from "@/lib/chain/wagmi";
import { useForge } from "@/store/forge";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useForge((s) => s.hydrate);
  const error = useForge((s) => s.error);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    hydrate();
    const id = setInterval(() => hydrate(), 2500);
    return () => clearInterval(id);
  }, [hydrate]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <IntroOverlay />
        <ForgeCursor />
        <CommandPalette />
        {error && (
          <div className="bg-down/20 text-down text-center text-xs font-mono py-1.5 border-b border-down/30">
            Live connection issue: {error} — retrying…
          </div>
        )}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
