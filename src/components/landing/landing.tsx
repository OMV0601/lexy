"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, FileCheck2, Globe2, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { buttonClass } from "@/components/ui/button";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { Logo } from "@/components/ui/logo";
import { SiteHeader } from "@/components/site-header";
import { ResultPreview } from "./result-preview";
import { WalkthroughButton } from "@/components/tour/walkthrough";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const HOW_ICONS = [CalendarDays, Scale, FileCheck2];
const PRINCIPLE_ICONS = [Sparkles, ShieldCheck, Globe2];

export function Landing() {
  const { t } = useI18n();
  const l = t.landing;

  return (
    <div className="relative flex flex-1 flex-col">
      <GradientMesh className="h-[720px]" />
      <SiteHeader />

      {/* Hero */}
      <section className="relative mx-auto grid w-full max-w-6xl gap-14 px-6 pt-12 pb-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-20">
        <motion.div {...fade()}>
          <p className="text-eyebrow text-primary-deep">{l.eyebrow}</p>
          <h1 data-tour="hero-title" className="text-display-xxl mt-5 text-ink">{l.title}</h1>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed font-light text-ink-2">{l.lede}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/check" data-tour="hero-cta" className={buttonClass("primary", "lg")}>
              {l.ctaPrimary}
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link href="/check?demo=rosa" className={buttonClass("secondary", "lg")}>
              {l.ctaSecondary}
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-mute">{l.trust}</p>
        </motion.div>
        <motion.div data-tour="hero-preview" {...fade(0.15)} className="lg:pl-6">
          <ResultPreview />
        </motion.div>
      </section>

      {/* Stat band */}
      <section data-tour="stats" className="relative overflow-hidden bg-brand-dark text-white">
        <div aria-hidden className="pointer-events-none absolute -top-40 right-0 size-[520px] rounded-full bg-primary/40 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-52 left-10 size-[420px] rounded-full bg-ruby/25 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
          <motion.p {...fade()} className="text-eyebrow text-[#b9b9f9]">
            {l.statEyebrow}
          </motion.p>
          <motion.h2 {...fade(0.05)} className="text-display-xl mt-4 max-w-4xl text-white">
            {l.statTitle}
          </motion.h2>
          <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
            {l.stats.map((s, i) => (
              <motion.div key={s.label} {...fade(0.1 + i * 0.08)}>
                <p className="tnum text-[48px] leading-none font-light tracking-[-0.03em] text-white">{s.value}</p>
                <p className="mt-3 max-w-xs text-[15px] font-light text-white/70">{s.label}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-12 text-[12px] text-white/45">{l.statSource}</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-10 px-6 py-24">
        <motion.p {...fade()} className="text-eyebrow text-primary-deep">
          {l.howEyebrow}
        </motion.p>
        <motion.h2 {...fade(0.05)} className="text-display-xl mt-4 text-ink">
          {l.howTitle}
        </motion.h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {l.how.map((h, i) => {
            const Icon = HOW_ICONS[i];
            return (
              <motion.div key={h.title} {...fade(0.1 + i * 0.08)} className="rounded-xl bg-white p-7 ring-1 ring-hairline shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-wash text-primary">
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>
                  <span className="tnum text-[13px] text-mute-2">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-[22px] font-light tracking-[-0.01em] text-ink">{h.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed font-light text-ink-2">{h.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-canvas-soft">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <motion.p {...fade()} className="text-eyebrow text-primary-deep">
            {l.principleEyebrow}
          </motion.p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {l.principles.map((p, i) => {
              const Icon = PRINCIPLE_ICONS[i];
              return (
                <motion.div key={p.title} {...fade(0.05 + i * 0.08)}>
                  <Icon className="size-6 text-primary" strokeWidth={1.5} />
                  <h3 className="mt-4 text-[20px] font-light tracking-[-0.01em] text-ink">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed font-light text-ink-2">{p.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <motion.div {...fade()} className="relative overflow-hidden rounded-xl bg-cream px-8 py-14 sm:px-14">
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-[#ffc48a]/60 blur-[80px]" />
            <div className="relative flex flex-wrap items-end justify-between gap-8">
              <div>
                <h2 className="text-display-xl max-w-2xl text-ink">{l.finalTitle}</h2>
                <p className="mt-4 text-[17px] font-light text-ink-2">{l.finalBody}</p>
              </div>
              <Link href="/check" className={buttonClass("primary", "lg")}>
                {l.ctaPrimary}
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <WalkthroughButton />
      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <Logo />
          <p className="max-w-md text-[12px] text-mute">{l.footer}</p>
        </div>
      </footer>
    </div>
  );
}
