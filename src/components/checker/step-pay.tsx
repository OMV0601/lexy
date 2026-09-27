"use client";

import { Banknote, Clock3 } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n";
import { money } from "@/lib/format";
import { shiftMinutes } from "@/lib/wage/engine";
import { engineShifts, parseMoney, type CheckerState } from "./state";
import { Field, MoneyInput, StepHeading } from "./ui";

export function StepPay({
  state,
  onKind,
  onField,
}: {
  state: CheckerState;
  onKind: (kind: "flat" | "hourly") => void;
  onField: (field: "amount" | "rate" | "received", value: string) => void;
}) {
  const { t, lang } = useI18n();
  const p = t.check.pay;
  const totalHours = engineShifts(state).reduce((s, sh) => s + shiftMinutes(sh), 0) / 60;
  const assumed = parseMoney(state.rate) * totalHours;

  const kinds = [
    { kind: "flat" as const, label: p.flat, hint: p.flatHint, Icon: Banknote },
    { kind: "hourly" as const, label: p.hourly, hint: p.hourlyHint, Icon: Clock3 },
  ];

  return (
    <div>
      <StepHeading title={p.title} body={p.body} />
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {kinds.map(({ kind, label, hint, Icon }) => {
          const active = state.payKind === kind;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onKind(kind)}
              className={clsx(
                "flex items-start gap-3 rounded-lg bg-white p-4 text-left ring-1 transition",
                active ? "ring-2 ring-primary shadow-float" : "ring-hairline shadow-lift hover:ring-hairline-input",
              )}
            >
              <span
                className={clsx(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  active ? "bg-primary text-white" : "bg-canvas-soft text-mute",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-[16px] text-ink">{label}</span>
                <span className="block text-[13px] text-mute">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {state.payKind === "flat" ? (
        <div className="max-w-sm">
          <Field label={p.amount}>
            <MoneyInput value={state.amount} onChange={(v) => onField("amount", v)} ariaLabel={p.amount} autoFocus />
          </Field>
        </div>
      ) : (
        <div className="grid max-w-xl gap-5 sm:grid-cols-2">
          <Field label={p.rate}>
            <MoneyInput value={state.rate} onChange={(v) => onField("rate", v)} ariaLabel={p.rate} autoFocus />
          </Field>
          <Field
            label={p.received}
            hint={assumed > 0 && !state.received ? p.receivedHint(money(assumed, lang)) : undefined}
          >
            <MoneyInput value={state.received} onChange={(v) => onField("received", v)} ariaLabel={p.received} />
          </Field>
        </div>
      )}
    </div>
  );
}
