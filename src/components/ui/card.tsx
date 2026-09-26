import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type Tone = "light" | "soft" | "cream" | "dark";

const tones: Record<Tone, string> = {
  light: "bg-white text-ink ring-1 ring-hairline shadow-lift",
  soft: "bg-canvas-soft text-ink ring-1 ring-hairline",
  cream: "bg-cream text-ink",
  dark: "bg-brand-dark text-white",
};

export function Card({
  tone = "light",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={clsx("rounded-lg", tones[tone], className)} {...props} />;
}
