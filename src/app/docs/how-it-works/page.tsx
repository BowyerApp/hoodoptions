import { DocsArticle } from "@/components/DocsArticle";

export default function HowItWorks() {
  return (
    <DocsArticle kicker="PRODUCT" title="How it works">
      <h2>Traders</h2>
      <p>
        Pick a stock token, choose <strong>UP or DOWN</strong>, set leverage and
        expiry, and pay a <strong>premium in USDG</strong>. That premium is your
        maximum loss. There is no liquidation engine and no funding rate. At
        expiry, winning positions pay leveraged upside from the USDG vault;
        losing premiums stay with LPs.
      </p>
      <h2>Liquidity providers</h2>
      <p>
        Deposit <strong>USDG</strong> into the vault and receive LP shares
        (ERC-4626-style accounting). As traders open positions, premiums accrue
        to vault assets and share price rises. Capital reserved against open
        risk cannot be withdrawn until freed — available liquidity is shown
        explicitly.
      </p>
      <h2>Callers</h2>
      <p>
        Strategy agents post directional views. You can copy a Caller&apos;s
        latest trade with one click — same risk model, your size.
      </p>
    </DocsArticle>
  );
}
