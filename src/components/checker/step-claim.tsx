"use client";

import { ExternalLink, Printer, RotateCcw, Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { clockLabel, hours as fmtHours, money } from "@/lib/format";
import { projectUnderpayment, type WeekResult } from "@/lib/wage/engine";
import { CITATIONS, JURISDICTIONS } from "@/lib/wage/law";
import { Button, buttonClass } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import type { CheckerState } from "./state";

const LEGAL_AID_URL = "https://www.lawhelpca.org/";

export function StepClaim({
  state,
  result,
  weeks,
  onField,
  onStartOver,
}: {
  state: CheckerState;
  result: WeekResult;
  weeks: number;
  onField: (field: "workerName" | "employerName", value: string) => void;
  onStartOver: () => void;
}) {
  const { t, lang } = useI18n();
  const c = t.check.claim;
  const r = t.check.result;
  const w = t.check.week;
  const m = (n: number) => money(n, lang);
  const j = JURISDICTIONS[result.jurisdictionId];
  const today = new Intl.DateTimeFormat(lang === "es" ? "es-US" : "en-US", { dateStyle: "long" }).format(new Date());
  const weeksLabel = r.presets.find((p) => p.weeks === weeks)?.label ?? r.weeks(weeks);

  const fmtValues = (values: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, k === "hours" ? fmtHours(v, lang) : k === "days" ? String(v) : m(v)]),
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="text-eyebrow mb-3 text-primary-deep">{c.eyebrow}</p>
          <h1 className="text-display-xl text-ink">{c.title}</h1>
          <p className="mt-3 max-w-xl text-[16px] font-light text-ink-2">{c.body}</p>
        </div>
      </div>

      {/* The document */}
      <article className="rounded-xl bg-white p-6 ring-1 ring-hairline shadow-float sm:p-10 print:p-0 print:shadow-none print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-6">
          <div className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <div>
              <p className="text-eyebrow text-mute">{c.eyebrow}</p>
              <p className="mt-1 text-[22px] font-light tracking-[-0.01em] text-ink">Clocked</p>
            </div>
          </div>
          <p className="tnum text-[13px] text-mute">{today}</p>
        </header>

        <div className="grid gap-5 border-b border-hairline py-6 sm:grid-cols-2">
          <DocInput label={c.worker} value={state.workerName} placeholder={c.optional} onChange={(v) => onField("workerName", v)} />
          <DocInput label={c.employer} value={state.employerName} placeholder={c.optional} onChange={(v) => onField("employerName", v)} />
          <DocField label={c.location} value={`${j.name} · ${m(j.minimumWage)}/h (${j.source.cite})`} />
          <DocField label={c.period} value={c.weekOf} />
        </div>

        <section className="border-b border-hairline py-6">
          <h3 className="text-eyebrow mb-3 text-mute">{c.schedule}</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
            {state.shifts.map((s) => (
              <p key={s.day} className="tnum text-[14px] text-ink">
                <span className="inline-block w-12 text-mute">{w.days[s.day]}</span>
                {clockLabel(s.start)}–{clockLabel(s.end)}
              </p>
            ))}
          </div>
          <p className="tnum mt-3 text-[14px] text-ink-2">
            {c.hoursWorked}: {fmtHours(result.totalHours, lang)} · {t.check.week.mealQ}: {w.mealOptions[state.breakMinutes === 0 ? 0 : state.breakMinutes === 30 ? 1 : 2]}
          </p>
        </section>

        <section className="border-b border-hairline py-6">
          <h3 className="text-eyebrow mb-3 text-mute">{c.violations}</h3>
          <ol className="space-y-2.5">
            {result.findings.map((f, i) => (
              <li key={f.id} className="flex gap-3 text-[14px] text-ink">
                <span className="tnum w-5 shrink-0 text-mute">{i + 1}.</span>
                <span>
                  {r.finding[f.id](fmtValues(f.values))}{" "}
                  <span className="whitespace-nowrap text-primary-deep">({f.citation.cite})</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-6">
          <h3 className="text-eyebrow mb-3 text-mute">{c.amounts}</h3>
          <table className="w-full text-[14px]">
            <tbody className="divide-y divide-hairline">
              {result.lines.map((line) => (
                <tr key={line.id}>
                  <td className="py-2 text-ink">{r.lines[line.id]}</td>
                  <td className="tnum py-2 text-mute">
                    {line.id === "mealPremium" || line.id === "restPremium"
                      ? `${line.hours} ${r.unitDays(line.hours)} × ${m(line.rate)}`
                      : `${fmtHours(line.hours, lang)} h × ${m(line.rate)}`}
                  </td>
                  <td className="py-2 text-[12px] text-primary-deep">{line.citation.cite}</td>
                  <td className="tnum py-2 text-right text-ink">{m(line.amount)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 text-mute" colSpan={3}>{r.paidLine}</td>
                <td className="tnum py-2 text-right text-mute">− {m(result.paid)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-ruby-wash p-4">
              <p className="text-[13px] text-ruby-deep">{c.total}</p>
              <p className="tnum mt-1 text-[30px] font-light tracking-[-0.02em] text-ruby-deep">{m(result.underpaid)}</p>
            </div>
            <div className="rounded-lg bg-canvas-soft p-4 ring-1 ring-hairline">
              <p className="text-[13px] text-ink-2">{c.overTime(weeksLabel)}</p>
              <p className="tnum mt-1 text-[30px] font-light tracking-[-0.02em] text-ink">
                {money(projectUnderpayment(result.underpaid, weeks), lang, { cents: false })}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-canvas-soft p-5 ring-1 ring-hairline sm:p-6">
          <h3 className="text-[18px] font-light tracking-[-0.01em] text-ink">{c.next}</h3>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {c.steps.map((s, i) => (
              <li key={s.title}>
                <span className="tnum flex size-7 items-center justify-center rounded-full bg-primary text-[13px] text-white">{i + 1}</span>
                <p className="mt-2 text-[14px] font-medium text-ink">{s.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-6 flex items-start gap-2 text-[12px] text-mute">
          <Scale className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
          {c.disclaimer}
        </p>
      </article>

      <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
        <a href={CITATIONS.labor.url} target="_blank" rel="noreferrer" className={buttonClass("primary", "lg")}>
          {c.file}
          <ExternalLink className="size-4" strokeWidth={1.75} />
        </a>
        <Button size="lg" variant="secondary" onClick={() => window.print()}>
          <Printer className="size-4" strokeWidth={1.75} />
          {c.print}
        </Button>
        <a href={LEGAL_AID_URL} target="_blank" rel="noreferrer" className={buttonClass("ghost", "lg")}>
          {c.legalAid}
        </a>
        <Button size="lg" variant="ghost" onClick={onStartOver} className="sm:ml-auto">
          <RotateCcw className="size-4" strokeWidth={1.75} />
          {c.startOver}
        </Button>
      </div>
    </div>
  );
}

function DocField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-eyebrow text-mute">{label}</p>
      <p className="tnum mt-1.5 text-[15px] text-ink">{value}</p>
    </div>
  );
}

function DocInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-eyebrow block text-mute">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-b border-dashed border-hairline-input bg-transparent py-1 text-[15px] text-ink outline-none placeholder:text-mute-2 focus:border-primary print:border-none"
      />
    </label>
  );
}
