import { DocsArticle } from "@/components/DocsArticle";

export default function RiskDoc() {
  return (
    <DocsArticle kicker="RISK" title="Risk model">
      <h2>Option buyers</h2>
      <p>
        <strong>Max loss = premium paid.</strong> No margin calls. No
        liquidation. Worst case: option expires worthless and the premium
        remains with the vault.
      </p>
      <h2>Liquidity providers</h2>
      <p>
        LPs earn premiums and fees but back winning payouts. Utilization shows
        how much vault capital is reserved against open risk. Withdrawals are
        capped by free liquidity so the vault stays solvent.
      </p>
      <h2>On-chain guarantees (Phase 2)</h2>
      <p>
        Markets are designed fully collateralized — similar in spirit to
        covered-call / cash-secured put invariants. Oracle freshness and
        invalid-print rejection bound settlement risk. Issuer controls on
        stock tokens and USDG remain an external dependency.
      </p>
    </DocsArticle>
  );
}
