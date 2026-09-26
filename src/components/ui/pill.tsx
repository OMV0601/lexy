import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type Tone = "indigo" | "ruby" | "paid" | "neutral";

const tones: Record<Tone, string> = {
  indigo: "bg-primary-wash text-primary-deep",
  ruby: "bg-ruby-wash text-ruby-deep",
  paid: "bg-paid-wash text-paid",
  neutral: "bg-canvas-soft text-ink-2 ring-1 ring-inset ring-hairline",
};

export function Pill({
  tone = "indigo",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
