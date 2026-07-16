import { DocsArticle } from "@/components/DocsArticle";

export default function DocsHome() {
  return (
    <DocsArticle kicker="OVERVIEW" title="HoodOptions for RWAs & tokenized stocks">
      <p>
        HoodOptions is the <strong>options and USDG liquidity layer</strong> for
        stock tokens and real-world assets on{" "}
        <strong>Robinhood Chain</strong>. Traders take leveraged UP/DOWN views
        with max loss equal to the premium. Liquidity providers deposit USDG
        and earn those premiums.
      </p>
      <p>
        Unlike ETH-first options venues, every market on HoodOptions is a{" "}
        <strong>tokenized equity or RWA</strong> that lives natively on Robinhood
        Chain — NVDA, TSLA, SPCX, AMD, and peers.
      </p>
      <h2>What you can do</h2>
      <ul>
        <li>Trade defined-risk options on stock tokens</li>
        <li>Deposit USDG into the vault and earn yield from premiums</li>
        <li>Follow Callers and copy strategies</li>
        <li>Read quotes via the public markets API</li>
      </ul>
      <p>
        This documentation explains why Robinhood Chain, how settlement works,
        and how the product maps to on-chain architecture.
      </p>
    </DocsArticle>
  );
}
