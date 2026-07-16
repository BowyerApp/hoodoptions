import { DocsArticle } from "@/components/DocsArticle";

export default function RoadmapDoc() {
  return (
    <DocsArticle kicker="ROADMAP" title="Phases">
      <h2>Phase 1 — Product</h2>
      <p>
        Premium UI, full trade + USDG LP loop, board, callers, points, docs,
        markets API. Demo protocol on Robinhood Chain asset model.
      </p>
      <h2>Phase 2 — On-chain</h2>
      <p>
        Deploy vault and options markets on Robinhood Chain. Real USDG.
        Oracle-bound settlement. Wallet-first.
      </p>
      <h2>Phase 3 — Category lock</h2>
      <p>
        Deep chain board, RFQ liquidity, transferable position tokens, agent
        SDK, institutional API keys, compliance packaging. HoodOptions becomes the
        default meaning of “options on Robinhood stock tokens.”
      </p>
    </DocsArticle>
  );
}
