import { describe, expect, it } from "vitest";
import {
  classifyWeek,
  computeWeek,
  parseClock,
  projectUnderpayment,
  shiftMinutes,
  type Shift,
  type Weekday,
} from "./engine";
import { CITATIONS, JURISDICTIONS } from "./law";

const shift = (day: Weekday, start: string, end: string, breakMinutes = 0): Shift => ({
  day,
  start,
  end,
  breakMinutes,
});

const days = (list: Weekday[], start: string, end: string, breakMinutes = 0) =>
  list.map((d) => shift(d, start, end, breakMinutes));

const hours = (minutes: number) => minutes / 60;

describe("time parsing", () => {
  it("parses HH:MM", () => {
    expect(parseClock("08:30")).toBe(510);
    expect(parseClock("0:00")).toBe(0);
  });

  it("rejects malformed times", () => {
    expect(() => parseClock("8am")).toThrow();
    expect(() => parseClock("25:00")).toThrow();
  });

  it("subtracts the unpaid break", () => {
    expect(shiftMinutes(shift(0, "09:00", "17:30", 30))).toBe(480);
  });

  it("handles shifts that run past midnight", () => {
    expect(shiftMinutes(shift(0, "22:00", "06:00", 30))).toBe(450);
  });
});

describe("daily overtime (Lab. Code §510)", () => {
  it("an 8-hour day is all regular time", () => {
    const [d] = classifyWeek([shift(0, "09:00", "17:30", 30)], true);
    expect(hours(d.regularMinutes)).toBe(8);
    expect(d.overtimeMinutes).toBe(0);
  });

  it("hours 9 through 12 are overtime", () => {
    const [d] = classifyWeek([shift(0, "07:00", "18:30", 30)], true);
    expect(hours(d.regularMinutes)).toBe(8);
    expect(hours(d.overtimeMinutes)).toBe(3);
    expect(d.doubleTimeMinutes).toBe(0);
  });

  it("hours past 12 are double time", () => {
    const [d] = classifyWeek([shift(0, "06:00", "19:30", 30)], true);
    expect(hours(d.regularMinutes)).toBe(8);
    expect(hours(d.overtimeMinutes)).toBe(4);
    expect(hours(d.doubleTimeMinutes)).toBe(1);
  });
});

describe("weekly overtime", () => {
  it("regular hours past 40 in the week become overtime", () => {
    const week = classifyWeek(
      [...days([0, 1, 2, 3, 4], "08:00", "17:30", 30), shift(5, "09:00", "15:00")],
      true,
    );
    const reg = week.reduce((s, d) => s + d.regularMinutes, 0);
    const ot = week.reduce((s, d) => s + d.overtimeMinutes, 0);
    expect(hours(reg)).toBe(40);
    expect(hours(ot)).toBe(5 + 6);
  });
});

describe("seventh consecutive day", () => {
  it("the first 8 hours on the 7th day are overtime", () => {
    const week = classifyWeek(days([0, 1, 2, 3, 4, 5, 6], "09:00", "17:30", 30), true);
    const sunday = week.find((d) => d.day === 6)!;
    expect(sunday.seventhDay).toBe(true);
    expect(sunday.regularMinutes).toBe(0);
    expect(hours(sunday.overtimeMinutes)).toBe(8);
    expect(hours(week.reduce((s, d) => s + d.regularMinutes, 0))).toBe(40);
  });

  it("hours past 8 on the 7th day are double time", () => {
    const week = classifyWeek(
      [...days([0, 1, 2, 3, 4, 5], "09:00", "17:30", 30), shift(6, "08:00", "18:30", 30)],
      true,
    );
    const sunday = week.find((d) => d.day === 6)!;
    expect(hours(sunday.overtimeMinutes)).toBe(8);
    expect(hours(sunday.doubleTimeMinutes)).toBe(2);
  });

  it("does not apply when a day off falls in the week", () => {
    const week = classifyWeek(days([0, 1, 2, 3, 4, 6], "09:00", "17:30", 30), true);
    expect(week.some((d) => d.seventhDay)).toBe(false);
  });
});

describe("meal and rest premiums (Lab. Code §§512, 226.7)", () => {
  it("no meal premium for a 5-hour day", () => {
    const [d] = classifyWeek([shift(0, "09:00", "14:00")], true);
    expect(d.mealPremium).toBe(false);
  });

  it("meal premium when a day runs past 5 hours with no 30-minute break", () => {
    const [d] = classifyWeek([shift(0, "09:00", "14:30", 15)], true);
    expect(d.mealPremium).toBe(true);
  });

  it("rest premium only when rest breaks were not provided", () => {
    expect(classifyWeek([shift(0, "09:00", "17:30", 30)], false)[0].restPremium).toBe(true);
    expect(classifyWeek([shift(0, "09:00", "17:30", 30)], true)[0].restPremium).toBe(false);
  });
});

describe("computeWeek", () => {
  it("Rosa: 72 hours in Los Angeles for $700 cash", () => {
    const result = computeWeek({
      jurisdiction: "los-angeles",
      shifts: days([0, 1, 2, 3, 4, 5], "08:00", "20:00"),
      pay: { kind: "flat", amount: 700 },
      restBreaksProvided: false,
    });

    expect(result.totalHours).toBe(72);
    expect(result.baseRate).toBe(18.42);
    expect(result.baseRateSource).toBe("minimum-wage");
    const byId = Object.fromEntries(result.lines.map((l) => [l.id, l]));
    expect(byId.regular.hours).toBe(40);
    expect(byId.regular.amount).toBe(736.8);
    expect(byId.overtime.hours).toBe(32);
    expect(byId.overtime.rate).toBe(27.63);
    expect(byId.overtime.amount).toBe(884.16);
    expect(byId.mealPremium.amount).toBe(110.52);
    expect(byId.restPremium.amount).toBe(110.52);
    expect(result.owed).toBe(1842);
    expect(result.paid).toBe(700);
    expect(result.underpaid).toBe(1142);
    expect(result.effectiveHourlyRate).toBe(9.72);
    expect(result.liquidatedDamages).toBe(626.24);
    expect(result.findings.map((f) => f.id)).toEqual([
      "below-minimum-wage",
      "unpaid-overtime",
      "missed-meal-periods",
      "missed-rest-breaks",
    ]);
  });

  it("a fair salary for 40 hours owes nothing", () => {
    const result = computeWeek({
      jurisdiction: "ca",
      shifts: days([0, 1, 2, 3, 4], "09:00", "17:30", 30),
      pay: { kind: "flat", amount: 1000 },
      restBreaksProvided: true,
    });
    expect(result.baseRate).toBe(25);
    expect(result.baseRateSource).toBe("salary");
    expect(result.lines[0].citation).toEqual(CITATIONS.salaryRegularRate);
    expect(result.owed).toBe(1000);
    expect(result.underpaid).toBe(0);
    expect(result.findings).toEqual([]);
  });

  it("hourly worker paid straight time for overtime hours", () => {
    const result = computeWeek({
      jurisdiction: "ca",
      shifts: days([0, 1, 2, 3, 4], "08:00", "18:30", 30),
      pay: { kind: "hourly", rate: 20, amountReceived: 1000 },
      restBreaksProvided: true,
    });
    expect(result.totalHours).toBe(50);
    expect(result.owed).toBe(1100);
    expect(result.underpaid).toBe(100);
    expect(result.findings.map((f) => f.id)).toEqual(["unpaid-overtime"]);
  });

  it("hourly rate below the local minimum is raised to the minimum", () => {
    const result = computeWeek({
      jurisdiction: "san-francisco",
      shifts: days([0, 1, 2, 3, 4], "08:00", "16:30", 30),
      pay: { kind: "hourly", rate: 15 },
      restBreaksProvided: true,
    });
    expect(result.baseRate).toBe(JURISDICTIONS["san-francisco"].minimumWage);
    expect(result.paid).toBe(600);
    expect(result.owed).toBe(784.4);
    expect(result.underpaid).toBe(184.4);
    expect(result.findings[0].id).toBe("below-minimum-wage");
    expect(result.findings[0].citation).toEqual(JURISDICTIONS["san-francisco"].source);
  });

  it("combines two shifts on the same day before applying daily overtime", () => {
    const result = computeWeek({
      jurisdiction: "ca",
      shifts: [shift(0, "06:00", "11:00"), shift(0, "12:00", "18:00")],
      pay: { kind: "hourly", rate: 20 },
      restBreaksProvided: true,
    });
    const reg = result.lines.find((l) => l.id === "regular")!;
    const ot = result.lines.find((l) => l.id === "overtime")!;
    expect(reg.hours).toBe(8);
    expect(ot.hours).toBe(3);
  });
});

describe("projectUnderpayment", () => {
  it("multiplies a weekly gap over time", () => {
    expect(projectUnderpayment(1142, 26)).toBe(29692);
  });

  it("stops at the three-year lookback", () => {
    expect(projectUnderpayment(100, 400)).toBe(15600);
  });
});
