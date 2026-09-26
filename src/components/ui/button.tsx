import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "dark" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-deep active:bg-primary-press shadow-[0_1px_2px_rgba(46,43,140,0.3)]",
  secondary:
    "bg-white text-primary ring-1 ring-inset ring-primary/60 hover:ring-primary hover:bg-primary-wash",
  dark: "bg-brand-dark text-white hover:bg-ink",
  ghost: "text-ink-2 hover:bg-canvas-soft hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-[15px]",
  lg: "h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-full font-normal whitespace-nowrap",
    "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
    variants[variant],
    sizes[size],
    extra,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
