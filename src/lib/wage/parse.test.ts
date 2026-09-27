import { describe, expect, it } from "vitest";
import { parseWeekDescription } from "./parse";

const summary = (text: string) =>
  parseWeekDescription(text).shifts.map((s) => `${s.day} ${s.start}-${s.end} b${s.breakMinutes}`);

describe("parseWeekDescription — English", () => {
  it("day range with am/pm and no break", () => {
    const parsed = parseWeekDescription("Mon–Sat, 8am to 8pm, no break");
    expect(parsed.understood).toBe(true);
    expect(parsed.breakMinutes).toBe(0);
    expect(summary("Mon–Sat, 8am to 8pm, no break")).toEqual([
      "0 08:00-20:00 b0",
      "1 08:00-20:00 b0",
      "2 08:00-20:00 b0",
      "3 08:00-20:00 b0",
      "4 08:00-20:00 b0",
      "5 08:00-20:00 b0",
    ]);
  });

  it("two clauses with different hours", () => {
    expect(summary("Monday through Friday 9-5:30 with a 30 min lunch; Saturday 10am-4pm")).toEqual([
      "0 09:00-17:30 b30",
      "1 09:00-17:30 b30",
      "2 09:00-17:30 b30",
      "3 09:00-17:30 b30",
      "4 09:00-17:30 b30",
      "5 10:00-16:00 b30",
    ]);
  });

  it("split shift: a second time range with no days of its own", () => {
    expect(summary("Mon-Wed 8am-12pm and 5pm-9pm, 30 min lunch")).toEqual([
      "0 08:00-12:00 b30",
      "0 17:00-21:00 b0",
      "1 08:00-12:00 b30",
      "1 17:00-21:00 b0",
      "2 08:00-12:00 b30",
      "2 17:00-21:00 b0",
    ]);
  });

  it("a later clause that names a day replaces that day's hours", () => {
    expect(summary("Mon-Sat 8am-8pm, Saturday 10am-4pm")).toEqual([
      "0 08:00-20:00 b0",
      "1 08:00-20:00 b0",
      "2 08:00-20:00 b0",
      "3 08:00-20:00 b0",
      "4 08:00-20:00 b0",
      "5 10:00-16:00 b0",
    ]);
  });

  it("times before days", () => {
    expect(summary("8am-8pm Monday to Wednesday")).toEqual([
      "0 08:00-20:00 b0",
      "1 08:00-20:00 b0",
      "2 08:00-20:00 b0",
    ]);
  });

  it("list of days and 24-hour times", () => {
    expect(summary("Mon, Wed, Fri 14:00-22:30")).toEqual([
      "0 14:00-22:30 b0",
      "2 14:00-22:30 b0",
      "4 14:00-22:30 b0",
    ]);
  });

  it("group words", () => {
    expect(parseWeekDescription("6 days a week, 7am to 7pm").shifts).toHaveLength(6);
    expect(parseWeekDescription("every day noon to midnight").shifts[0]).toMatchObject({
      start: "12:00",
      end: "00:00",
    });
  });

  it("infers meridiem from the end time", () => {
    expect(summary("Tuesday 1-9pm")).toEqual(["1 13:00-21:00 b0"]);
    expect(summary("Tuesday 8-4pm")).toEqual(["1 08:00-16:00 b0"]);
  });

  it("returns not understood for unrelated text", () => {
    expect(parseWeekDescription("I wash dishes").understood).toBe(false);
  });
});

describe("parseWeekDescription — Spanish", () => {
  it("lunes a sábado de 8 a 8, sin descanso", () => {
    const parsed = parseWeekDescription("lunes a sábado de 8 a 8, sin descanso");
    expect(parsed.breakMinutes).toBe(0);
    expect(parsed.shifts).toHaveLength(6);
    expect(parsed.shifts[0]).toMatchObject({ start: "08:00", end: "20:00" });
  });

  it("media hora de comida", () => {
    const parsed = parseWeekDescription("de lunes a viernes de 9am a 6pm, media hora de comida");
    expect(parsed.breakMinutes).toBe(30);
    expect(parsed.shifts).toHaveLength(5);
    expect(parsed.shifts[4]).toMatchObject({ day: 4, start: "09:00", end: "18:00", breakMinutes: 30 });
  });

  it("todos los días", () => {
    expect(parseWeekDescription("todos los días de 7am a 3pm").shifts).toHaveLength(7);
  });
});
