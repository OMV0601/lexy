"use client";

import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, CheckCircle2, Pencil, Scale } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n";
import { hours as fmtHours, money } from "@/lib/format";
import { projectUnderpayment, type WeekResult } from "@/lib/wage/engine";
import { JURISDICTIONS, LOOKBACK_WEEKS, type Citation } from "@/lib/wage/law";
import { Button } from "@/components/ui/button";
import { CountUp } from "./count-up";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function CiteLink({ citation, className }: { citation: Citation; className?: string }) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        "inline-flex items-center gap-1 rounded-full bg-primary-wash px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-primary-deep transition hover:bg-primary-subdued",
        className,
      )}
    >
      <Scale className="size-3" strokeWidth={2} />
      {citation.cite}
    </a>
  );
}

export function StepResult({
  result,
  weeks,
  onWeeks,
  onClaim,
  onEdit,
}: {
  result: WeekResult;
  weeks: number;
  onWeeks: (n: number) => void;
  onClaim: () => void;
  onEdit: () => void;
}) {
  const { t, lang } = useI18n();
  const r = t.check.result;
  const city = JURISDICTIONS[result.jurisdictionId];
  const cityName = city.shortName;
  const m = (n: number) => money(n, lang);
  const owedSomething = result.underpaid > 0;
  const ratePct = Math.min(100, (result.effectiveHourlyRate / result.minimumWage) * 100);
  const projected = projectUnderpayment(result.underpaid, weeks);

  const fmtValues = (values: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(values).map(([k, v]) => [
        k,
        k === "hours" ? fmtHours(v, lang) : k === "days" ? String(v) : m(v),
      ]),
    );

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.section
        {...rise(0)}
        className="relative overflow-hidden rounded-xl bg-brand-dark p-6 text-white shadow-hero sm:p-9"
      >
        <div aria-hidden className="pointer-events-none absolute -top-40 -right-24 size-[420px] rounded-full bg-ruby/35 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-24 size-[380px] rounded-full bg-primary/45 blur-[90px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <p className="text-eyebrow text-white/60">{owedSomething ? r.eyebrow : r.evenEyebrow}</p>
            {owedSomething ? (
              <CountUp
                value={result.underpaid}
                format={m}
                duration={2}
                delay={0.25}
                className="tnum mt-3 block text-[56px] leading-none font-light tracking-[-0.035em] text-[#ff5c8a] sm:text-[84px]"
              />
            ) : (
              <p className="mt-4 flex items-center gap-3 text-[30px] font-light tracking-[-0.02em] text-white">
                <CheckCircle2 className="size-8 text-[#5ee0b5]" strokeWidth={1.5} />
                {r.evenTitle}
              </p>
            )}
            <p className="mt-5 max-w-md text-[16px] font-light text-white/80">
              {r.summary(m(result.paid), fmtHours(result.totalHours, lang), m(result.effectiveHourlyRate))}{" "}
              {r.minimum(cityName, m(result.minimumWage))}
            </p>
          </div>

          {/* Rate comparison */}
          <div className="rounded-lg bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur">
            <RateBar
              label={lang === "es" ? "Lo que ganaste por hora" : "What you earned per hour"}
              value={m(result.effectiveHourlyRate)}
              pct={ratePct}
              tone={result.effectiveHourlyRate < result.minimumWage ? "ruby" : "paid"}
            />
            <div className="h-4" />
            <RateBar
              label={lang === "es" ? `Mínimo legal · ${cityName}` : `Legal minimum · ${cityName}`}
              value={m(result.minimumWage)}
              pct={100}
              tone="white"
            />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Ledger */}
        <motion.section {...rise(0.9)} className="rounded-xl bg-white p-6 ring-1 ring-hairline shadow-lift sm:p-7">
          <h2 className="text-[20px] font-light tracking-[-0.01em] text-ink">{r.required}</h2>
          <p className="mt-1 text-[13px] text-mute">{r.requiredBody}</p>
          <ul className="mt-5 divide-y divide-hairline">
            {result.lines.map((line, i) => {
              const premium = line.id === "mealPremium" || line.id === "restPremium";
              return (
                <motion.li
                  key={line.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.05 + i * 0.12, duration: 0.4 }}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] text-ink">{r.lines[line.id]}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="tnum text-[13px] text-mute">
                        {premium
                          ? `${line.hours} ${r.unitDays(line.hours)} × ${m(line.rate)}`
                          : `${fmtHours(line.hours, lang)} ${r.unitHours} × ${m(line.rate)}`}
                      </span>
                      <CiteLink citation={line.citation} />
                    </div>
                  </div>
                  <span className="tnum shrink-0 text-[16px] text-ink">{m(line.amount)}</span>
                </motion.li>
              );
            })}
          </ul>
          <div className="mt-2 space-y-2 border-t border-ink/15 pt-4">
            <Row label={lang === "es" ? "Total que exige la ley" : "Total the law requires"} value={m(result.owed)} />
            <Row label={r.paidLine} value={`− ${m(result.paid)}`} muted />
            <div
              className={clsx(
                "flex items-center justify-between rounded-md px-3 py-3",
                owedSomething ? "bg-ruby-wash text-ruby-deep" : "bg-paid-wash text-paid",
              )}
            >
              <span className="text-[15px] font-medium">{r.gap}</span>
              <span className="tnum text-[20px] font-medium tracking-[-0.01em]">{m(result.underpaid)}</span>
            </div>
          </div>
        </motion.section>

        {/* Findings */}
        <motion.section {...rise(1.2)} className="rounded-xl bg-white p-6 ring-1 ring-hairline shadow-lift sm:p-7">
          <h2 className="text-[20px] font-light tracking-[-0.01em] text-ink">
            {result.findings.length === 0 ? r.checksTitle : r.findings}
          </h2>
          {result.findings.length === 0 ? (
            <ul className="mt-5 space-y-3">
              {r.checks.map((c) => (
                <li key={c} className="flex items-center gap-3 text-[15px] text-ink">
                  <span className="flex size-7 items-center justify-center rounded-full bg-paid-wash">
                    <CheckCircle2 className="size-4 text-paid" strokeWidth={2} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-5 space-y-4">
              {result.findings.map((f, i) => (
                <motion.li
                  key={f.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.35 + i * 0.15, duration: 0.4 }}
                  className="flex gap-3"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ruby-wash">
                    <AlertTriangle className="size-3.5 text-ruby-deep" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[14px] leading-snug text-ink">{r.finding[f.id](fmtValues(f.values))}</p>
                    <CiteLink citation={f.citation} className="mt-1.5" />
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>

      {/* Over time */}
      {owedSomething && (
        <motion.section id="over-time" {...rise(1.5)} className="scroll-mt-24 rounded-xl bg-cream p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-eyebrow text-lemon">{r.zoomEyebrow}</p>
              <h2 className="mt-2 text-[26px] font-light tracking-[-0.015em] text-ink">{r.zoomTitle}</h2>
              <CountUp
                value={projected}
                format={(n) => money(n, lang, { cents: false })}
                duration={1.1}
                className="tnum mt-3 block text-[52px] leading-none font-light tracking-[-0.035em] text-ruby-deep sm:text-[64px]"
              />
              <p className="tnum mt-2 text-[14px] text-ink-2">{r.weeks(weeks)}</p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {r.presets.map((p) => (
                  <button
                    key={p.weeks}
                    type="button"
                    onClick={() => onWeeks(p.weeks)}
                    className={clsx(
                      "h-9 rounded-full px-4 text-[14px] transition",
                      weeks === p.weeks ? "bg-ink text-white" : "bg-white/70 text-ink-2 ring-1 ring-ink/10 hover:bg-white",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={LOOKBACK_WEEKS}
                value={weeks}
                onChange={(e) => onWeeks(Number(e.target.value))}
                aria-label={r.zoomTitle}
                className="mt-6 w-full accent-[#c4144d]"
              />
              <p className="mt-3 text-[13px] text-ink-2">{r.zoomNote}</p>
              {result.liquidatedDamages > 0 && (
                <p className="mt-2 text-[13px] text-ink-2">{r.liquidated(m(result.liquidatedDamages))}</p>
              )}
            </div>
          </div>
        </motion.section>
      )}

      <motion.div {...rise(1.7)} className="flex flex-wrap items-center gap-3 pt-2">
        {owedSomething ? (
          <Button size="lg" onClick={onClaim}>
            {r.cta}
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button size="lg" onClick={onEdit}>
            {r.another}
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </Button>
        )}
        {owedSomething && (
          <Button size="lg" variant="ghost" onClick={onEdit}>
            <Pencil className="size-4" strokeWidth={1.75} />
            {r.edit}
          </Button>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3">
      <span className={clsx("text-[14px]", muted ? "text-mute" : "text-ink-2")}>{label}</span>
      <span className={clsx("tnum text-[15px]", muted ? "text-mute" : "text-ink")}>{value}</span>
    </div>
  );
}

function RateBar({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "ruby" | "paid" | "white";
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-white/70">{label}</span>
        <span className="tnum text-[18px] font-light text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={clsx(
            "h-full rounded-full",
            tone === "ruby" && "bg-gradient-to-r from-ruby to-[#ff5c8a]",
            tone === "paid" && "bg-[#5ee0b5]",
            tone === "white" && "bg-white/85",
          )}
        />
      </div>
    </div>
  );
}
