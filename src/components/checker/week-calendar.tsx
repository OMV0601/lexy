"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { parseClock, type Weekday } from "@/lib/wage/engine";
import { clockLabel } from "@/lib/format";
import type { DraftShift } from "./state";

const ROW = 22; // px per hour
const DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function span(shift: DraftShift) {
  const start = parseClock(shift.start) / 60;
  let end = parseClock(shift.end) / 60;
  if (end <= start) end += 24;
  return { start, end };
}

function axis(shifts: DraftShift[]) {
  let lo = 7;
  let hi = 21;
  for (const s of shifts) {
    const { start, end } = span(s);
    lo = Math.min(lo, Math.floor(start));
    hi = Math.max(hi, Math.ceil(end));
  }
  return { lo: Math.max(0, lo - 1), hi: Math.min(30, hi + 1) };
}

export function WeekCalendar({
  shifts,
  dayLabels,
  selected,
  onSelect,
  onAdd,
  addLabel,
}: {
  shifts: DraftShift[];
  dayLabels: string[];
  /** Index into `shifts`. */
  selected: number | null;
  onSelect: (index: number) => void;
  onAdd: (day: Weekday) => void;
  addLabel: string;
}) {
  const { lo, hi } = axis(shifts);
  const height = (hi - lo) * ROW;
  const byDay = new Map<Weekday, Array<{ shift: DraftShift; index: number }>>();
  shifts.forEach((shift, index) => byDay.set(shift.day, [...(byDay.get(shift.day) ?? []), { shift, index }]));
  const hourMarks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-hairline shadow-float sm:p-5">
      <div className="grid grid-cols-[36px_repeat(7,minmax(0,1fr))] gap-x-1.5 sm:gap-x-2">
        <div />
        {DAYS.map((d) => (
          <div
            key={d}
            className={clsx(
              "pb-3 text-center text-[12px] font-medium tracking-[0.02em]",
              byDay.has(d) ? "text-ink" : "text-mute-2",
            )}
          >
            {dayLabels[d]}
          </div>
        ))}

        {/* Hour gutter */}
        <div className="relative" style={{ height }}>
          {hourMarks.map((h, i) =>
            i % 2 === 0 && i < hourMarks.length - 1 ? (
              <span
                key={h}
                className="tnum absolute right-1 -translate-y-1/2 text-[10px] text-mute-2"
                style={{ top: i * ROW }}
              >
                {clockLabel(`${String(h % 24).padStart(2, "0")}:00`, true)}
              </span>
            ) : null,
          )}
        </div>

        {DAYS.map((d) => {
          const dayShifts = byDay.get(d) ?? [];
          return (
            <div
              key={d}
              className="group relative overflow-hidden rounded-md bg-canvas-soft"
              style={{
                height,
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${ROW * 2 - 1}px, #e3e8ee ${ROW * 2 - 1}px, #e3e8ee ${ROW * 2}px)`,
              }}
            >
              <AnimatePresence>
                {dayShifts.map(({ shift, index }, n) => {
                  const s = span(shift);
                  const isSelected = selected === index;
                  const short = s.end - s.start < 3;
                  return (
                    <motion.button
                      type="button"
                      data-tour={`shift-${shift.day}-${n}`}
                      key={`${shift.day}-${n}`}
                      onClick={() => onSelect(index)}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 170, damping: 22, delay: d * 0.07 }}
                      className={clsx(
                        "absolute inset-x-0.5 origin-top overflow-hidden rounded-[7px] px-1 text-left text-white sm:px-1.5",
                        "bg-gradient-to-b from-primary-soft to-primary-deep shadow-[0_6px_16px_-6px_rgba(68,52,212,0.6)]",
                        isSelected && "ring-2 ring-offset-2 ring-offset-canvas-soft ring-magenta",
                      )}
                      style={{ top: (s.start - lo) * ROW, height: (s.end - s.start) * ROW }}
                      aria-label={`${dayLabels[d]} ${clockLabel(shift.start)}–${clockLabel(shift.end)}`}
                    >
                      {!short && (
                        <>
                          <span className="tnum absolute top-1 left-1 text-[10px] leading-tight font-medium opacity-90 sm:left-1.5 sm:text-[11px]">
                            {clockLabel(shift.start, true)}
                          </span>
                          <span className="tnum absolute bottom-1 left-1 text-[10px] leading-tight opacity-80 sm:left-1.5 sm:text-[11px]">
                            {clockLabel(shift.end, true)}
                          </span>
                        </>
                      )}
                      <span className="tnum absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[13px] font-medium sm:text-[15px]">
                        {Math.round((s.end - s.start) * 10) / 10}h
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
              {dayShifts.length === 0 && (
                <button
                  type="button"
                  onClick={() => onAdd(d)}
                  className="absolute inset-0 flex items-center justify-center text-mute-2 opacity-60 transition hover:bg-primary-wash hover:text-primary hover:opacity-100"
                  aria-label={`${addLabel}: ${dayLabels[d]}`}
                >
                  <Plus className="size-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
