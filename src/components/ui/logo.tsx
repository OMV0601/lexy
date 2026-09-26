import { clsx } from "clsx";

/** Clock face whose minute hand has been pulled back — time that was taken. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={clsx("size-7", className)}>
      <defs>
        <linearGradient id="clocked-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#665efd" />
          <stop offset="1" stopColor="#2e2b8c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#clocked-mark)" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="white" strokeWidth="2" opacity="0.95" />
      <path d="M16 16 L16 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 16 L20 18.5" stroke="#f96bee" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.4" fill="white" />
    </svg>
  );
}

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span
        className={clsx(
          "text-[19px] font-medium tracking-[-0.02em]",
          onDark ? "text-white" : "text-ink",
        )}
      >
        Clocked
      </span>
    </span>
  );
}
