import { DocsArticle } from "@/components/DocsArticle";

export default function WhyRH() {
  return (
    <DocsArticle kicker="CHAIN" title="Why Robinhood Chain">
      <p>
        Robinhood Chain is an Arbitrum Orbit L2 purpose-built for{" "}
        <strong>tokenized stocks and RWAs</strong>. Stock tokens are ERC-20s
        with corporate-action aware multiplier semantics; USDG is the native
        dollar stablecoin for settlement.
      </p>
      <h2>Why HoodOptions deploys here</h2>
      <ul>
        <li>
          <strong>Assets are native</strong> — options settle against the same
          tokens users already hold, not synthetic ETH mirrors.
        </li>
        <li>
          <strong>USDG collateral</strong> — one quote asset for premiums, LP
          deposits, and payouts.
        </li>
        <li>
          <strong>Sub-cent gas</strong> — frequent option opens and expiry
          settlements stay economical.
        </li>
        <li>
          <strong>Chainlink / RH feeds</strong> — Phase 2 binds settlement to
          official price rounds on-chain.
        </li>
      </ul>
      <p>
        Testnet chain id <code>46630</code> · Mainnet <code>4663</code>. HoodOptions
        does not target Base or Arbitrum as primary — the category is Robinhood
        stock tokens.
      </p>
    </DocsArticle>
  );
}
