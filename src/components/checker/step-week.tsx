"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Sparkles, Trash2, Wand2, Zap } from "lucide-react";
import { clsx } from "clsx";
import { useI18n } from "@/lib/i18n";
import { hours as fmtHours } from "@/lib/format";
import { parseClock, shiftMinutes, type Weekday } from "@/lib/wage/engine";
import { parseWeekDescription } from "@/lib/wage/parse";
import { Button } from "@/components/ui/button";
import { engineShifts, workedDays, type CheckerState, type DraftShift } from "./state";
import { Segmented, StepHeading } from "./ui";
import { WeekCalendar } from "./week-calendar";

type ReadStatus =
  | { kind: "idle" }
  | { kind: "reading" }
  | { kind: "done"; count: number; source: "instant" | "ai" }
  | { kind: "failed" };

export function StepWeek({
  state,
  onSetShifts,
  onAdd,
  onUpdate,
  onRemove,
  onBreak,
  onRest,
  autoType,
  onAutoTypeDone,
}: {
  state: CheckerState;
  onSetShifts: (shifts: DraftShift[], breakMinutes: number | null) => void;
  onAdd: (shift: DraftShift) => void;
  onUpdate: (index: number, shift: DraftShift) => void;
  onRemove: (index: number) => void;
  onBreak: (minutes: 0 | 30 | 60) => void;
  onRest: (value: boolean) => void;
  /** Demo mode: type this text into the box, then read it. */
  autoType?: string | null;
  onAutoTypeDone?: () => void;
}) {
  const { t, lang } = useI18n();
  const w = t.check.week;
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ReadStatus>({ kind: "idle" });
  /** Index into state.shifts of the shift being edited. */
  const [selected, setSelected] = useState<number | null>(null);
  const typingRef = useRef(false);

  const totalMinutes = engineShifts(state).reduce((s, sh) => s + shiftMinutes(sh), 0);

  async function read(input: string) {
    const value = input.trim();
    if (!value) return;
    const local = parseWeekDescription(value);
    if (local.understood) {
      onSetShifts(local.shifts.map(({ day, start, end }) => ({ day, start, end })), local.breakMinutes);
      setStatus({ kind: "done", count: local.shifts.length, source: "instant" });
      setSelected(null);
      return;
    }
    setStatus({ kind: "reading" });
    try {
      const res = await fetch("/api/parse-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { shifts: Array<DraftShift & { breakMinutes: number }> };
      const breakMinutes = data.shifts[0]?.breakMinutes ?? null;
      onSetShifts(data.shifts.map(({ day, start, end }) => ({ day, start, end })), breakMinutes);
      setStatus({ kind: "done", count: data.shifts.length, source: "ai" });
      setSelected(null);
    } catch {
      setStatus({ kind: "failed" });
    }
  }

  // Demo mode: type the description character by character, then read it.
  useEffect(() => {
    if (!autoType || typingRef.current) return;
    typingRef.current = true;
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setText(autoType.slice(0, i));
      if (i < autoType.length) {
        window.setTimeout(tick, 38 + Math.random() * 40);
      } else {
        window.setTimeout(() => {
          if (cancelled) return;
          void read(autoType);
          typingRef.current = false;
          onAutoTypeDone?.();
        }, 450);
      }
    };
    const start = window.setTimeout(tick, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      typingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoType]);

  const selectedShift = selected === null ? null : (state.shifts[selected] ?? null);
  const shiftsThatDay = selectedShift ? state.shifts.filter((s) => s.day === selectedShift.day) : [];

  /** Index the new shift will have once the reducer sorts it in. */
  const indexAfterAdd = (shift: DraftShift) =>
    [...state.shifts, shift]
      .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
      .indexOf(shift);

  function addShift(day: Weekday) {
    const template = state.shifts[state.shifts.length - 1];
    const shift = { day, start: template?.start ?? "09:00", end: template?.end ?? "17:00" };
    onAdd(shift);
    setSelected(indexAfterAdd(shift));
  }

  /** A second shift on the same day, starting an hour after the latest one ends. */
  function addSplitShift(day: Weekday) {
    const latestEnd = Math.max(
      ...state.shifts.filter((s) => s.day === day).map((s) => {
        const start = parseClock(s.start);
        const end = parseClock(s.end);
        return end <= start ? end + 1440 : end;
      }),
    );
    const start = Math.min(latestEnd + 60, 23 * 60);
    const end = Math.min(start + 4 * 60, 23 * 60 + 45);
    const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const shift = { day, start: clock(start), end: clock(end) };
    onAdd(shift);
    setSelected(indexAfterAdd(shift));
  }

  return (
    <div>
      <StepHeading title={w.title} body={w.body} />

      {/* Describe your week */}
      <form
        data-tour="describe"
        onSubmit={(e) => {
          e.preventDefault();
          void read(text);
        }}
        className="mb-5 rounded-xl bg-white p-2 ring-1 ring-hairline shadow-lift focus-within:ring-2 focus-within:ring-primary"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="ml-3 size-5 shrink-0 text-primary" strokeWidth={1.75} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={w.describePlaceholder}
            aria-label={w.describe}
            className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-mute-2"
          />
          <Button type="submit" disabled={!text.trim() || status.kind === "reading"} className="shrink-0" aria-label={w.fill}>
            <Wand2 className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{status.kind === "reading" ? w.reading : w.fill}</span>
          </Button>
        </div>
      </form>
      <div data-tour="read-status" className="mb-6 min-h-5 text-[13px]">
        <AnimatePresence mode="wait">
          {status.kind === "done" ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-ink-2"
            >
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  status.source === "ai" ? "bg-primary-wash text-primary-deep" : "bg-paid-wash text-paid",
                )}
              >
                {status.source === "ai" ? <Sparkles className="size-3" /> : <Zap className="size-3" />}
                {status.source === "ai" ? w.readAi : w.readInstant}
              </span>
              {w.readBy(status.count)}
            </motion.p>
          ) : status.kind === "failed" ? (
            <motion.p key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ruby-deep">
              {w.notUnderstood}
            </motion.p>
          ) : status.kind === "reading" ? (
            <motion.p key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse text-mute">
              {w.reading}
            </motion.p>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-mute">
              {w.describeHint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div data-tour="calendar">
      <WeekCalendar
        shifts={state.shifts}
        dayLabels={w.days}
        selected={selected}
        onSelect={(i) => setSelected(selected === i ? null : i)}
        onAdd={addShift}
        addLabel={w.addShift}
      />
      </div>

      {/* Totals + shift editor */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="tnum text-[15px] text-ink">
          {state.shifts.length > 0 ? w.totalHours(fmtHours(totalMinutes / 60, lang), workedDays(state.shifts)) : w.empty}
        </p>
        {state.shifts.length > 0 && !selectedShift && <p className="text-[13px] text-mute">{w.selectHint}</p>}
      </div>

      <AnimatePresence>
        {selectedShift && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div data-tour="shift-editor" className="mt-3 flex flex-wrap items-end gap-4 rounded-lg bg-canvas-soft p-4 ring-1 ring-hairline">
              <p className="w-full text-[14px] font-medium text-ink sm:w-auto sm:min-w-28 sm:self-center">
                {w.daysLong[selectedShift.day]}
              </p>
              <TimeField
                label={w.start}
                value={selectedShift.start}
                onChange={(v) => onUpdate(selected!, { ...selectedShift, start: v })}
              />
              <TimeField
                label={w.end}
                value={selectedShift.end}
                onChange={(v) => onUpdate(selected!, { ...selectedShift, end: v })}
              />
              <div className="ml-auto flex flex-wrap gap-2">
                {shiftsThatDay.length < 3 && (
                  <Button variant="ghost" onClick={() => addSplitShift(selectedShift.day)}>
                    <Plus className="size-4" strokeWidth={1.75} />
                    {w.addSplit}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-ruby-deep hover:text-ruby-deep"
                  onClick={() => {
                    onRemove(selected!);
                    setSelected(null);
                  }}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} />
                  {w.remove}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breaks */}
      <div data-tour="breaks" className="mt-8 grid gap-4 border-t border-hairline pt-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-[14px] text-ink">{w.mealQ}</p>
          <Segmented
            value={state.breakMinutes}
            options={[
              { value: 0 as const, label: w.mealOptions[0] },
              { value: 30 as const, label: w.mealOptions[1] },
              { value: 60 as const, label: w.mealOptions[2] },
            ]}
            onChange={onBreak}
          />
        </div>
        <div>
          <p className="mb-3 text-[14px] text-ink">{w.restQ}</p>
          <Segmented
            value={state.restBreaks}
            options={[
              { value: true, label: w.yes },
              { value: false, label: w.no },
            ]}
            onChange={onRest}
          />
        </div>
      </div>
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-mute">{label}</span>
      <input
        type="time"
        value={value}
        step={900}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="tnum h-10 rounded-sm bg-white px-3 text-[15px] text-ink ring-1 ring-hairline-input outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}
