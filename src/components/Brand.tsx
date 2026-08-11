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
      viewBox="0 0 28 28"
      fill="none"
      className={`text-current ${className}`}
      aria-hidden="true"
    >
      {/* Two-sided depth ladder: a compact, exchange-native mark. */}
      <path
        d="M3 5H13V8H3V5ZM3 12.5H16V15.5H3V12.5ZM3 20H11V23H3V20Z"
        fill="currentColor"
      />
      <path
        d="M16 5H25V8H16V5ZM13 12.5H25V15.5H13V12.5ZM18 20H25V23H18V20Z"
        fill="currentColor"
        fillOpacity="0.42"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-semibold uppercase leading-none tracking-[0.115em] ${className}`}
    >
      HoodOptions
    </span>
  );
}
