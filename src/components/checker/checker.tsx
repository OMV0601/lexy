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

export function Checker({ demo }: { demo?: string | null }) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(reducer, demo === "rosa" ? demoState : initialState);
  const [weeks, setWeeks] = useState(26);

  const input = useMemo(() => weekInput(state), [state]);
  const result = useMemo(() => (input ? computeWeek(input) : null), [input]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step]);

  const go = (step: Step) => dispatch({ type: "go", step });

  const canContinue =
    (state.step === 0 && state.jurisdiction !== null) ||
    (state.step === 1 && state.shifts.length > 0) ||
    (state.step === 2 && payInput(state) !== null && state.shifts.length > 0);

  const steps = t.check.steps;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-canvas-soft">
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
                onUpsert={(shift) => dispatch({ type: "upsertShift", shift })}
                onRemove={(day) => dispatch({ type: "removeShift", day })}
                onBreak={(minutes) => dispatch({ type: "setBreak", minutes })}
                onRest={(value) => dispatch({ type: "setRest", value })}
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
