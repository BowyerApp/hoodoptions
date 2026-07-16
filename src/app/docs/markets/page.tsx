import { DocsArticle } from "@/components/DocsArticle";
import { MARKETS } from "@/lib/chain/robinhood";

export default function MarketsDoc() {
  return (
    <DocsArticle kicker="MARKETS" title="Stock tokens & RWAs">
      <p>
        All underlyings are <strong>Robinhood Chain stock tokens or RWAs</strong>.
        Quote asset is always <strong>USDG</strong>.
      </p>
      <ul>
        {MARKETS.map((m) => (
          <li key={m.symbol}>
            <code>{m.symbol}</code> — {m.name} ({m.kind}) · IV{" "}
            {(m.iv * 100).toFixed(0)}%
          </li>
        ))}
      </ul>
      <p>
        Expiries: 1H, 8H, 24H, 7D. Leverage bands: 2×–10× map to strike
        distance for the simplified UP/DOWN ticket; the Board exposes the
        strike × expiry matrix.
      </p>
    </DocsArticle>
  );
}
