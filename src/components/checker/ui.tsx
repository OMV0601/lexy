"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

export function StepHeading({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="text-eyebrow mb-3 text-primary-deep">{eyebrow}</p>}
      <h1 className="text-display-xl text-ink">{title}</h1>
      {body && <p className="mt-3 max-w-xl text-[16px] font-light text-ink-2">{body}</p>}
    </div>
  );
}

export function Segmented<T extends string | number | boolean>({
  value,
  options,
  onChange,
  className,
}: {
  value: T | null;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={clsx("inline-flex rounded-full bg-canvas-soft p-1 ring-1 ring-hairline", className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "h-8 rounded-full px-4 text-[14px] transition",
            value === o.value ? "bg-white text-ink shadow-lift ring-1 ring-hairline" : "text-mute hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-[13px] text-mute">{hint}</span>}
    </label>
  );
}

export function MoneyInput({
  value,
  onChange,
  size = "lg",
  placeholder = "0",
  autoFocus,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  size?: "lg" | "md";
  placeholder?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-baseline rounded-lg bg-white ring-1 ring-hairline-input transition focus-within:ring-2 focus-within:ring-primary",
        size === "lg" ? "px-5 py-3" : "px-4 py-2",
      )}
    >
      <span className={clsx("font-light text-mute", size === "lg" ? "text-[34px]" : "text-[20px]")}>$</span>
      <input
        inputMode="decimal"
        value={value}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
        className={clsx(
          "tnum ml-1 w-full bg-transparent font-light tracking-[-0.02em] text-ink outline-none placeholder:text-mute-2",
          size === "lg" ? "text-[40px] leading-tight" : "text-[22px]",
        )}
      />
    </div>
  );
}
