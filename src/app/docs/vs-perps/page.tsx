import { DocsArticle } from "@/components/DocsArticle";

export default function VsPerps() {
  return (
    <DocsArticle kicker="COMPARE" title="HoodOptions vs perps">
      <p>
        Perpetuals dominate crypto leverage — and liquidate conviction on a
        wick. HoodOptions is built for traders who want{" "}
        <strong>directional exposure on stock tokens</strong> with a known max
        loss.
      </p>
      <ul>
        <li>
          <strong>Perps:</strong> funding, liquidation price, open-ended
          duration
        </li>
        <li>
          <strong>HoodOptions:</strong> premium, expiry, capped loss, no funding
        </li>
      </ul>
      <p>
        For RWAs on Robinhood Chain, defined-risk options are the natural
        primitive — not a perpetual that treats NVDA like a meme coin.
      </p>
    </DocsArticle>
  );
}
