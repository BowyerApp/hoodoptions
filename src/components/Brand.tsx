export function LogoMark({
  size = 26,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 27 L28 27"
        stroke="var(--copper, #c4a574)"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <path
        d="M4 25 L12.5 15.5 L17 19.5 L27 8.5"
        stroke="var(--copper, #c4a574)"
        strokeWidth="2.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M19.5 7.5 H27.5 V15.5"
        stroke="var(--copper, #c4a574)"
        strokeWidth="2.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`tracking-tight ${className}`}>
      Hood<span className="text-copper">Options</span>
    </span>
  );
}
