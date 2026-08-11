"use client";

import { usePrivy } from "@privy-io/react-auth";
import { WalletButton } from "@/components/WalletButton";

/** Keeps transaction signing explicitly wallet-gated after Privy identity auth. */
export function WalletAccessControl() {
  const { authenticated } = usePrivy();
  return authenticated ? <WalletButton /> : null;
}
