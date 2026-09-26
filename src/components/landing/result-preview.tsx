"use client";

import { AlertTriangle, Scale, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { money } from "@/lib/format";
import { computeWeek } from "@/lib/wage/engine";
import { CountUp } from "@/components/checker/count-up";

const SAMPLE = computeWeek({
  jurisdiction: "los-angeles",
  shifts: [0, 1, 2, 3, 4, 5].map((d) => ({ day: d as 0, start: "08:00", end: "20:00", breakMinutes: 0 })),
  pay: { kind: "flat", amount: 700 },
  restBreaksProvided: false,
});

/** Hero composite: a live render of the result card, computed by the real engine. */
export function ResultPreview() {
  const { t, lang } = useI18n();
  const r = t.check.result;
  const m = (n: number) => money(n, lang);

  return (
    <div className="relative">
      {/* What the worker typed */}
      <div className="relative z-10 mb-[-18px] ml-2 inline-flex max-w-full -rotate-2 items-center gap-2.5 rounded-full bg-white py-2 pr-4 pl-2 ring-1 ring-hairline shadow-float">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-wash">
          <Sparkles className="size-3.5 text-primary" strokeWidth={2} />
        </span>
        <span className="truncate text-[14px] text-ink">{t.check.week.describePlaceholder}</span>
        <span className="tnum hidden shrink-0 rounded-full bg-canvas-soft px-2 py-0.5 text-[12px] text-ink-2 ring-1 ring-hairline sm:inline">
          $700
        </span>
      </div>

      {/* Result card */}
      <div className="relative ml-auto w-full max-w-[440px] overflow-hidden rounded-xl bg-brand-dark p-6 text-white shadow-hero">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-ruby/40 blur-[70px]" />
        <div className="relative">
          <p className="text-eyebrow text-white/60">{r.eyebrow}</p>
          <CountUp
            value={SAMPLE.underpaid}
            format={m}
            delay={0.6}
            duration={2.2}
            className="tnum mt-2 block text-[52px] leading-none font-light tracking-[-0.035em] text-[#ff5c8a]"
          />
          <p className="tnum mt-3 text-[13px] text-white/70">
            {r.summary(m(SAMPLE.paid), "72", m(SAMPLE.effectiveHourlyRate))}
          </p>
          <div className="mt-5 space-y-2.5 rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10">
            {SAMPLE.lines.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-white/80">
                  <Scale className="size-3 text-[#b9b9f9]" strokeWidth={2} />
                  {r.lines[l.id]}
                </span>
                <span className="tnum text-white">{m(l.amount)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-[12px] leading-snug text-white/70">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[#ff5c8a]" strokeWidth={2} />
            {r.finding["below-minimum-wage"]({ effectiveRate: m(SAMPLE.effectiveHourlyRate), minimumWage: m(SAMPLE.minimumWage) })}
          </p>
        </div>
      </div>
    </div>
  );
}
