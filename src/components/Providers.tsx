"use client";

import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { Toaster } from "sonner";
import { ForgeCursor } from "./ForgeCursor";
import { CommandPalette } from "./CommandPalette";
import { IntroOverlay } from "./motion/IntroOverlay";
import { wagmiConfig } from "@/lib/chain/wagmi";
import { useForge } from "@/store/forge";
import { isPrivyConfigured, privyAppId } from "@/lib/auth/privy";

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
        {isPrivyConfigured && privyAppId ? (
          <PrivyProvider appId={privyAppId}>
            <AppShell error={error}>{children}</AppShell>
          </PrivyProvider>
        ) : (
          <AppShell error={error}>{children}</AppShell>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function AppShell({
  children,
  error,
}: {
  children: React.ReactNode;
  error: string | null;
}) {
  return (
    <>
      <IntroOverlay />
      <ForgeCursor />
      <CommandPalette />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "w-[356px] flex items-start gap-3 border border-border bg-surface px-4 py-3 font-mono text-[12.5px] text-text shadow-2xl",
            title: "text-text",
            description: "text-muted text-[11.5px] mt-0.5 break-all",
            actionButton:
              "ml-auto shrink-0 border border-copper/40 text-copper px-2 py-1 text-[11px] hover:bg-copper-dim",
            icon: "hidden",
          },
        }}
      />
      {error && (
        <div className="bg-down/20 text-down text-center text-xs font-mono py-1.5 border-b border-down/30">
          Live connection issue: {error} — retrying…
        </div>
      )}
      {children}
    </>
  );
}
