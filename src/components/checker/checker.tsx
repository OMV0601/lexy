"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n";
import { computeWeek } from "@/lib/wage/engine";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LangToggle } from "@/components/site-header";
import { demoState, initialState, payInput, reducer, weekInput, type Step } from "./state";
import { StepWhere } from "./step-where";
import { StepWeek } from "./step-week";
import { StepPay } from "./step-pay";
import { StepResult } from "./step-result";
import { StepClaim } from "./step-claim";

/** Demo pacing, in milliseconds. Tuned for a narrated screen recording. */
const BEAT = {
  pickCity: 1400,
  afterCity: 1100,
  afterFill: 1900,
  afterRest: 1200,
  typeDigit: 220,
  afterAmount: 1000,
  sweepStart: 5200,
  sweepStep: 45,
  toClaim: 3800,
};

export function Checker({ demo }: { demo?: string | null }) {
  const { t, lang } = useI18n();
  const playing = demo === "play";
  const [state, dispatch] = useReducer(reducer, demo === "rosa" ? demoState : initialState);
  const [weeks, setWeeks] = useState(playing ? 1 : 26);
  const [autoType, setAutoType] = useState<string | null>(null);

  const input = useMemo(() => weekInput(state), [state]);
  const result = useMemo(() => (input ? computeWeek(input) : null), [input]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step]);

  const go = (step: Step) => dispatch({ type: "go", step });

  // Demo mode: play Rosa's whole story hands-free, one beat at a time.
  useEffect(() => {
    if (!playing) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (state.step === 0) {
      at(BEAT.pickCity, () => dispatch({ type: "setJurisdiction", id: "los-angeles" }));
      at(BEAT.pickCity + BEAT.afterCity, () => dispatch({ type: "go", step: 1 }));
    } else if (state.step === 1) {
      at(300, () =>
        setAutoType(lang === "es" ? "lunes a sábado de 8 a 8, sin descanso" : "Mon–Sat, 8am to 8pm, no break"),
      );
    } else if (state.step === 2) {
      const digits = "700";
      digits.split("").forEach((_, i) =>
        at(700 + i * BEAT.typeDigit, () => dispatch({ type: "setField", field: "amount", value: digits.slice(0, i + 1) })),
      );
      at(700 + digits.length * BEAT.typeDigit + BEAT.afterAmount, () => dispatch({ type: "go", step: 3 }));
    } else if (state.step === 3) {
      // Bring the over-time card into view, sweep it from one week to one year,
      // then move on to the claim summary.
      at(BEAT.sweepStart - 900, () =>
        document.getElementById("over-time")?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
      for (let w = 2; w <= 52; w++) at(BEAT.sweepStart + (w - 2) * BEAT.sweepStep, () => setWeeks(w));
      at(BEAT.sweepStart + 51 * BEAT.sweepStep + BEAT.toClaim, () => dispatch({ type: "go", step: 4 }));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [playing, state.step, lang]);

  function afterDemoTyping() {
    const timers = [
      window.setTimeout(() => dispatch({ type: "setRest", value: false }), BEAT.afterFill),
      window.setTimeout(() => dispatch({ type: "go", step: 2 }), BEAT.afterFill + BEAT.afterRest),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }

  const canContinue =
    (state.step === 0 && state.jurisdiction !== null) ||
    (state.step === 1 && state.shifts.length > 0) ||
    (state.step === 2 && payInput(state) !== null && state.shifts.length > 0);

  const steps = t.check.steps;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas-soft print:bg-white">
      <header className="sticky top-0 z-20 border-b border-hairline bg-white/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="Clocked home">
            <Logo />
          </Link>
          <ol className="hidden items-center gap-1 md:flex" aria-label="Progress">
            {steps.map((label, i) => {
              const done = i < state.step;
              const current = i === state.step;
              return (
                <li key={label} className="flex items-center gap-1">
                  <span
                    className={clsx(
                      "flex items-center gap-2 rounded-full px-2.5 py-1 text-[13px] transition",
                      current ? "bg-primary-wash text-primary-deep" : done ? "text-ink-2" : "text-mute-2",
                    )}
                  >
                    <span
                      className={clsx(
                        "tnum flex size-5 items-center justify-center rounded-full text-[11px]",
                        current ? "bg-primary text-white" : done ? "bg-ink text-white" : "ring-1 ring-hairline-input",
                      )}
                    >
                      {done ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
                    </span>
                    {label}
                  </span>
                  {i < steps.length - 1 && <span className="h-px w-4 bg-hairline" />}
                </li>
              );
            })}
          </ol>
          <LangToggle />
        </div>
        <div className="h-0.5 bg-hairline md:hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${((state.step + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <main className={clsx("mx-auto w-full flex-1 px-5 pt-10 pb-16 sm:pt-14", state.step >= 3 ? "max-w-5xl" : "max-w-3xl")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {state.step === 0 && (
              <StepWhere
                value={state.jurisdiction}
                onChange={(id) => {
                  dispatch({ type: "setJurisdiction", id });
                }}
              />
            )}
            {state.step === 1 && (
              <StepWeek
                state={state}
                onSetShifts={(shifts, breakMinutes) => dispatch({ type: "setShifts", shifts, breakMinutes })}
                onAdd={(shift) => dispatch({ type: "addShift", shift })}
                onUpdate={(index, shift) => dispatch({ type: "updateShift", index, shift })}
                onRemove={(index) => dispatch({ type: "removeShift", index })}
                onBreak={(minutes) => dispatch({ type: "setBreak", minutes })}
                onRest={(value) => dispatch({ type: "setRest", value })}
                autoType={playing ? autoType : null}
                onAutoTypeDone={afterDemoTyping}
              />
            )}
            {state.step === 2 && (
              <StepPay
                state={state}
                onKind={(kind) => dispatch({ type: "setPayKind", kind })}
                onField={(field, value) => dispatch({ type: "setField", field, value })}
              />
            )}
            {state.step === 3 && result && (
              <StepResult result={result} weeks={weeks} onWeeks={setWeeks} onClaim={() => go(4)} onEdit={() => go(1)} />
            )}
            {state.step === 4 && result && (
              <StepClaim
                state={state}
                result={result}
                weeks={weeks}
                onField={(field, value) => dispatch({ type: "setField", field, value })}
                onStartOver={() => dispatch({ type: "reset" })}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {state.step <= 2 && (
          <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
            {state.step > 0 ? (
              <Button variant="ghost" onClick={() => go((state.step - 1) as Step)}>
                <ArrowLeft className="size-4" strokeWidth={1.75} />
                {t.check.back}
              </Button>
            ) : (
              <span />
            )}
            <Button size="lg" disabled={!canContinue} onClick={() => go((state.step + 1) as Step)}>
              {state.step === 2 ? t.check.pay.see : t.check.next}
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
