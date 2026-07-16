import { DocsArticle } from "@/components/DocsArticle";

export default function Architecture() {
  return (
    <DocsArticle kicker="SYSTEM" title="Architecture">
      <p>
        HoodOptions separates <strong>product surface</strong> from{" "}
        <strong>settlement backend</strong> so the venue can be demo-reliable
        today and fully on-chain tomorrow — same UX.
      </p>
      <pre className="font-mono text-xs text-text bg-surface border border-border p-4 overflow-x-auto leading-6">{`Stock tokens / RWAs (RH Chain)
        │
        ▼
   Options engine  ←── quote (IV, leverage, expiry)
        │
        ├── premium (USDG) ──► USDG vault (LP shares)
        │
        └── settlement ──► payout from vault | premium retained
`}</pre>
      <h2>Phase 1 (current demo)</h2>
      <p>
        A TypeScript protocol engine mirrors vault shares, reserved capital,
        opens, and settlement. State persists locally. Markets and USDG use
        Robinhood Chain registry identities.
      </p>
      <h2>Phase 2 (on-chain)</h2>
      <p>
        Solidity vault + market contracts on Robinhood Chain bind to USDG and
        stock token addresses, with oracle round-bound settlement and a
        permissionless keeper. Full collateral — no liquidations.
      </p>
    </DocsArticle>
  );
}
