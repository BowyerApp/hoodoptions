import Link from "next/link";

const LINKS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/why-robinhood-chain", label: "Why Robinhood Chain" },
  { href: "/docs/how-it-works", label: "How it works" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/markets", label: "Markets" },
  { href: "/docs/risk", label: "Risk" },
  { href: "/docs/vs-perps", label: "Vs perps" },
  { href: "/docs/roadmap", label: "Roadmap" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10 grid lg:grid-cols-[220px_1fr] gap-10">
      <aside className="space-y-1 h-fit lg:sticky lg:top-24">
        <div className="font-mono text-xs text-copper tracking-widest mb-4">
          DOCS
        </div>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block py-1.5 text-sm text-muted hover:text-text"
          >
            {l.label}
          </Link>
        ))}
      </aside>
      <article className="prose-forge max-w-3xl">{children}</article>
    </div>
  );
}
