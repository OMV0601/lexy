"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { clsx } from "clsx";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/lib/i18n";

export function LangToggle({ className }: { className?: string }) {
  const { t, toggle } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        "inline-flex h-9 items-center gap-1.5 rounded-full bg-white/80 px-3 text-[13px] text-ink-2 ring-1 ring-hairline backdrop-blur transition hover:text-ink hover:ring-hairline-input",
        className,
      )}
      aria-label={t.lang.label}
    >
      <Languages className="size-4 text-primary" strokeWidth={1.75} />
      {t.lang.label}
    </button>
  );
}

export function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  const { t } = useI18n();
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" aria-label="Clocked home">
        <Logo />
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link href="/#how" className="hidden px-3 text-[14px] text-ink-2 hover:text-ink sm:inline">
          {t.nav.how}
        </Link>
        <LangToggle />
        {showCta && (
          <Link href="/check" className={buttonClass("primary", "md", "hidden sm:inline-flex")}>
            {t.nav.check}
          </Link>
        )}
      </nav>
    </header>
  );
}
