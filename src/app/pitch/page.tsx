import Link from "next/link";

const BEATS = [
  {
    t: "0–3",
    title: "Problem",
    body: "Robinhood Chain has stock tokens. Perps liquidate conviction. There is no premium options desk for RWAs.",
  },
  {
    t: "3–8",
    title: "Solution",
    body: "HoodOptions: UP/DOWN on tokenized stocks. Max loss = premium. No liquidation. USDG in / USDG out.",
  },
  {
    t: "8–16",
    title: "Live trade",
    body: "Open NVDA UP 5× 24H. Show payoff, Greeks, confirm. Portfolio blotter updates.",
    href: "/trade?symbol=NVDA",
  },
  {
    t: "16–24",
    title: "Live LP",
    body: "Deposit USDG. Show share price & APY. Premium from the trade accrues to the vault. Withdraw available.",
    href: "/earn",
  },
  {
    t: "24–28",
    title: "Why us",
    body: "Split: empty / ETH-first. Plume: contracts, no product. HoodOptions: the venue — UI, vault, docs, RH-native.",
  },
  {
    t: "28–30",
    title: "Ask",
    body: "Raise to ship Phase 2 on-chain on Robinhood Chain and lock the category.",
  },
];

export default function PitchPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 md:px-6 py-16">
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        30 MIN PITCH
      </div>
      <h1 className="text-4xl md:text-5xl mb-4">HoodOptions narrative</h1>
      <p className="text-muted mb-12">
        Run this page beside the product. Click through each beat.
      </p>
      <ol className="space-y-6">
        {BEATS.map((b, i) => (
          <li key={b.t} className="border border-border p-6">
            <div className="font-mono text-xs text-muted mb-2">
              {b.t} · {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="text-2xl mb-2">{b.title}</h2>
            <p className="text-muted mb-3">{b.body}</p>
            {b.href && (
              <Link href={b.href} className="text-sm text-copper" data-cursor>
                Open →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
