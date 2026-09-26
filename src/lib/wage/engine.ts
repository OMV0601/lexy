/**
 * Clocked wage engine.
 *
 * Pure, deterministic functions. No AI touches anything in this file: the
 * model may help a worker *describe* their week, but what they are owed is
 * computed here, from the rules in ./law.ts, and every line carries a cite.
 */
import {
  CITATIONS,
  JURISDICTIONS,
  LOOKBACK_WEEKS,
  MEAL_PERIOD,
  OVERTIME,
  REST_BREAK,
  type Citation,
  type JurisdictionId,
} from "./law";

/** Workweek runs Monday (0) to Sunday (6). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Shift = {
  day: Weekday;
  /** 24-hour "HH:MM". */
  start: string;
  /** 24-hour "HH:MM". An end at or before the start runs past midnight. */
  end: string;
  /** Unpaid meal break actually taken, in minutes. */
  breakMinutes: number;
};

export type PayInput =
  | { kind: "flat"; amount: number }
  | { kind: "hourly"; rate: number; amountReceived?: number };

export type WeekInput = {
  jurisdiction: JurisdictionId;
  shifts: Shift[];
  pay: PayInput;
  restBreaksProvided: boolean;
};

export type DayBreakdown = {
  day: Weekday;
  minutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  doubleTimeMinutes: number;
  seventhDay: boolean;
  mealPremium: boolean;
  restPremium: boolean;
};

export type LineId = "regular" | "overtime" | "doubleTime" | "mealPremium" | "restPremium";

export type LineItem = {
  id: LineId;
  /** Hours for time lines; number of premium hours (one per day) for premium lines. */
  hours: number;
  rate: number;
  amount: number;
  citation: Citation;
};

export type FindingId =
  | "below-minimum-wage"
  | "unpaid-overtime"
  | "unpaid-double-time"
  | "missed-meal-periods"
  | "missed-rest-breaks";

export type Finding = {
  id: FindingId;
  citation: Citation;
  /** Numbers the UI interpolates into the plain-language sentence. */
  values: Record<string, number>;
};

export type BaseRateSource = "minimum-wage" | "agreed-rate" | "salary";

export type WeekResult = {
  jurisdictionId: JurisdictionId;
  minimumWage: number;
  baseRate: number;
  baseRateSource: BaseRateSource;
  totalHours: number;
  days: DayBreakdown[];
  lines: LineItem[];
  owed: number;
  paid: number;
  underpaid: number;
  effectiveHourlyRate: number;
  /** Extra amount a court may add when pay fell below minimum wage (§1194.2). */
  liquidatedDamages: number;
  findings: Finding[];
};

const MINUTES_PER_DAY = 24 * 60;

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function parseClock(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) throw new Error(`Invalid time "${value}", expected HH:MM`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid time "${value}"`);
  return hours * 60 + minutes;
}

/** Minutes actually worked in a shift, after the unpaid break. */
export function shiftMinutes(shift: Shift): number {
  const start = parseClock(shift.start);
  let end = parseClock(shift.end);
  if (end <= start) end += MINUTES_PER_DAY;
  return Math.max(0, end - start - Math.max(0, shift.breakMinutes));
}

/**
 * Split each day's minutes into regular, overtime and double time under
 * Lab. Code §510, then convert regular minutes past 40 hours in the week
 * into overtime.
 */
export function classifyWeek(shifts: Shift[], restBreaksProvided: boolean): DayBreakdown[] {
  const minutesByDay = new Map<Weekday, { minutes: number; breakMinutes: number }>();
  for (const shift of shifts) {
    const entry = minutesByDay.get(shift.day) ?? { minutes: 0, breakMinutes: 0 };
    entry.minutes += shiftMinutes(shift);
    entry.breakMinutes += Math.max(0, shift.breakMinutes);
    minutesByDay.set(shift.day, entry);
  }

  const workedAllSeven = ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).every(
    (d) => (minutesByDay.get(d)?.minutes ?? 0) > 0,
  );

  const dailyRegularMax = OVERTIME.dailyRegularMax * 60;
  const dailyOvertimeMax = OVERTIME.dailyOvertimeMax * 60;
  const seventhRegularMax = OVERTIME.seventhDayRegularMax * 60;
  const weeklyRegularMax = OVERTIME.weeklyRegularMax * 60;

  let regularSoFar = 0;
  const days: DayBreakdown[] = [];

  for (const day of [0, 1, 2, 3, 4, 5, 6] as Weekday[]) {
    const entry = minutesByDay.get(day);
    if (!entry || entry.minutes <= 0) continue;
    const m = entry.minutes;
    const seventhDay = workedAllSeven && day === 6;

    let regular: number;
    let overtime: number;
    let doubleTime: number;

    if (seventhDay) {
      regular = 0;
      overtime = Math.min(m, seventhRegularMax);
      doubleTime = Math.max(0, m - seventhRegularMax);
    } else {
      regular = Math.min(m, dailyRegularMax);
      overtime = Math.min(Math.max(0, m - dailyRegularMax), dailyOvertimeMax - dailyRegularMax);
      doubleTime = Math.max(0, m - dailyOvertimeMax);
    }

    // Weekly overtime: regular minutes beyond 40 hours in the workweek.
    const room = Math.max(0, weeklyRegularMax - regularSoFar);
    if (regular > room) {
      overtime += regular - room;
      regular = room;
    }
    regularSoFar += regular;

    const hours = m / 60;
    days.push({
      day,
      minutes: m,
      regularMinutes: regular,
      overtimeMinutes: overtime,
      doubleTimeMinutes: doubleTime,
      seventhDay,
      mealPremium: hours > MEAL_PERIOD.requiredAfterHours && entry.breakMinutes < MEAL_PERIOD.minimumMinutes,
      restPremium: !restBreaksProvided && hours >= REST_BREAK.requiredFromHours,
    });
  }

  return days;
}

export function computeWeek(input: WeekInput): WeekResult {
  const jurisdiction = JURISDICTIONS[input.jurisdiction];
  const minimumWage = jurisdiction.minimumWage;
  const days = classifyWeek(input.shifts, input.restBreaksProvided);

  const totalMinutes = days.reduce((s, d) => s + d.minutes, 0);
  const totalHours = totalMinutes / 60;

  // The rate every line is built on. A flat weekly amount is treated as pay
  // for 40 regular hours (§515(d)); nothing may fall below minimum wage.
  let baseRate: number;
  let baseRateSource: BaseRateSource;
  let paid: number;
  if (input.pay.kind === "flat") {
    const salaryRate = input.pay.amount / OVERTIME.weeklyRegularMax;
    baseRate = Math.max(salaryRate, minimumWage);
    baseRateSource = salaryRate > minimumWage ? "salary" : "minimum-wage";
    paid = input.pay.amount;
  } else {
    baseRate = Math.max(input.pay.rate, minimumWage);
    baseRateSource = input.pay.rate > minimumWage ? "agreed-rate" : "minimum-wage";
    paid = input.pay.amountReceived ?? round2(input.pay.rate * totalHours);
  }
  baseRate = round2(baseRate);
  paid = round2(Math.max(0, paid));

  const sum = (pick: (d: DayBreakdown) => number) => days.reduce((s, d) => s + pick(d), 0);
  const regularHours = sum((d) => d.regularMinutes) / 60;
  const overtimeHours = sum((d) => d.overtimeMinutes) / 60;
  const doubleTimeHours = sum((d) => d.doubleTimeMinutes) / 60;
  const mealDays = days.filter((d) => d.mealPremium).length;
  const restDays = days.filter((d) => d.restPremium).length;

  const overtimeRate = round2(baseRate * OVERTIME.overtimeMultiplier);
  const doubleTimeRate = round2(baseRate * OVERTIME.doubleTimeMultiplier);

  const candidates: LineItem[] = [
    { id: "regular", hours: regularHours, rate: baseRate, amount: round2(regularHours * baseRate), citation: baseRateSource === "salary" ? CITATIONS.salaryRegularRate : jurisdiction.source },
    { id: "overtime", hours: overtimeHours, rate: overtimeRate, amount: round2(overtimeHours * overtimeRate), citation: CITATIONS.overtime },
    { id: "doubleTime", hours: doubleTimeHours, rate: doubleTimeRate, amount: round2(doubleTimeHours * doubleTimeRate), citation: CITATIONS.overtime },
    { id: "mealPremium", hours: mealDays, rate: baseRate, amount: round2(mealDays * baseRate), citation: CITATIONS.breakPremium },
    { id: "restPremium", hours: restDays, rate: baseRate, amount: round2(restDays * baseRate), citation: CITATIONS.breakPremium },
  ];
  const lines = candidates.filter((l) => l.hours > 0);

  const owed = round2(lines.reduce((s, l) => s + l.amount, 0));
  const underpaid = round2(Math.max(0, owed - paid));
  const effectiveHourlyRate = totalHours > 0 ? round2(paid / totalHours) : 0;
  const minimumForAllHours = round2(minimumWage * totalHours);
  const liquidatedDamages = round2(Math.max(0, minimumForAllHours - paid));

  const findings: Finding[] = [];
  if (underpaid > 0) {
    if (effectiveHourlyRate < minimumWage) {
      findings.push({
        id: "below-minimum-wage",
        citation: jurisdiction.source,
        values: { effectiveRate: effectiveHourlyRate, minimumWage, hours: totalHours },
      });
    }
    if (overtimeHours > 0) {
      findings.push({
        id: "unpaid-overtime",
        citation: CITATIONS.overtime,
        values: { hours: overtimeHours, rate: overtimeRate },
      });
    }
    if (doubleTimeHours > 0) {
      findings.push({
        id: "unpaid-double-time",
        citation: CITATIONS.overtime,
        values: { hours: doubleTimeHours, rate: doubleTimeRate },
      });
    }
    if (mealDays > 0) {
      findings.push({ id: "missed-meal-periods", citation: CITATIONS.mealPeriod, values: { days: mealDays } });
    }
    if (restDays > 0) {
      findings.push({ id: "missed-rest-breaks", citation: CITATIONS.breakPremium, values: { days: restDays } });
    }
  }

  return {
    jurisdictionId: jurisdiction.id,
    minimumWage,
    baseRate,
    baseRateSource,
    totalHours,
    days,
    lines,
    owed,
    paid,
    underpaid,
    effectiveHourlyRate,
    liquidatedDamages,
    findings,
  };
}

/** What a steady weekly gap adds up to, capped at the three-year lookback. */
export function projectUnderpayment(weeklyUnderpaid: number, weeks: number): number {
  const counted = Math.min(Math.max(0, Math.floor(weeks)), LOOKBACK_WEEKS);
  return round2(weeklyUnderpaid * counted);
}
