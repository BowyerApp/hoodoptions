export function DocsArticle({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-xs text-copper tracking-widest mb-3">
        {kicker}
      </div>
      <h1 className="text-4xl mb-8 tracking-tight">{title}</h1>
      <div className="space-y-5 text-[17px] leading-relaxed text-muted [&_strong]:text-text [&_code]:font-mono [&_code]:text-copper [&_code]:text-sm [&_h2]:text-text [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
