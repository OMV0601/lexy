/**
 * Turns a plain-language description of a work week into shifts.
 *
 * "Mon–Sat, 8am to 8pm, no break"
 * "lunes a sábado de 8 a 8, sin descanso"
 *
 * This is the deterministic path: it runs in the browser with no AI and no
 * network. The optional AI route returns the same structure and is checked
 * against the same schema before the engine ever sees it.
 */
import type { Shift, Weekday } from "./engine";

export type ParsedWeek = {
  shifts: Shift[];
  /** Break length the worker mentioned, if any. Applied to every shift. */
  breakMinutes: number | null;
  /** True when at least one day and one time range were understood. */
  understood: boolean;
};

const DAY_WORDS: Array<[RegExp, Weekday]> = [
  [/^(mon|monday|mondays|lun|lunes)$/, 0],
  [/^(tue|tues|tuesday|tuesdays|mar|martes)$/, 1],
  [/^(wed|weds|wednesday|wednesdays|mie|mié|miercoles|miércoles)$/, 2],
  [/^(thu|thur|thurs|thursday|thursdays|jue|jueves)$/, 3],
  [/^(fri|friday|fridays|vie|viernes)$/, 4],
  [/^(sat|saturday|saturdays|sab|sáb|sabado|sábado|sabados|sábados)$/, 5],
  [/^(sun|sunday|sundays|dom|domingo|domingos)$/, 6],
];

const GROUPS: Array<[RegExp, Weekday[]]> = [
  [/\b(every ?day|daily|7 days|seven days|todos los d[ií]as|7 d[ií]as|siete d[ií]as)\b/, [0, 1, 2, 3, 4, 5, 6]],
  [/\b(6 days|six days|6 d[ií]as|seis d[ií]as)\b/, [0, 1, 2, 3, 4, 5]],
  [/\b(5 days|five days|weekdays|5 d[ií]as|cinco d[ií]as|entre semana)\b/, [0, 1, 2, 3, 4]],
  [/\b(weekends?|fines? de semana)\b/, [5, 6]],
];

const RANGE_JOINERS = /^(-|–|—|to|through|thru|till|until|a|al|hasta)$/;

function dayOf(word: string): Weekday | null {
  for (const [re, day] of DAY_WORDS) if (re.test(word)) return day;
  return null;
}

function expandRange(from: Weekday, to: Weekday): Weekday[] {
  const out: Weekday[] = [];
  let d = from;
  for (let i = 0; i < 7; i++) {
    out.push(d);
    if (d === to) break;
    d = ((d + 1) % 7) as Weekday;
  }
  return out;
}

type Clock = { hour: number; minute: number; meridiem: "am" | "pm" | null };

const TIME_RE =
  /(noon|midday|mediod[ií]a|midnight|medianoche|\d{1,2}(?::\d{2})?\s*(?:a\.?\s?m\.?|p\.?\s?m\.?)?)/;
const TIME_RANGE_RE = new RegExp(
  `(?:from\\s+|de\\s+|desde\\s+)?${TIME_RE.source}\\s*(?:-|–|—|to|till|until|a|hasta)\\s*${TIME_RE.source}`,
  "g",
);

function readClock(raw: string): Clock | null {
  const text = raw.trim();
  if (/^(noon|midday|mediod[ií]a)$/.test(text)) return { hour: 12, minute: 0, meridiem: "pm" };
  if (/^(midnight|medianoche)$/.test(text)) return { hour: 12, minute: 0, meridiem: "am" };
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?$/.exec(text);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (hour > 23 || minute > 59) return null;
  const meridiem = m[3] ? (m[3].startsWith("a") ? "am" : "pm") : null;
  return { hour, minute, meridiem };
}

function to24(c: Clock, meridiem: "am" | "pm" | null): number {
  let h = c.hour;
  if (meridiem === "am" && h === 12) h = 0;
  if (meridiem === "pm" && h < 12) h += 12;
  return h * 60 + c.minute;
}

/** Resolve a start/end pair where one or both sides may lack am/pm. */
function resolveRange(start: Clock, end: Clock): [number, number] {
  const is24 = (c: Clock) => c.meridiem === null && c.hour > 12;
  let s: number;
  let e: number;
  if (start.meridiem || is24(start)) {
    s = to24(start, start.meridiem);
  } else if (end.meridiem) {
    // "1-9pm" → 13:00; "8-4pm" → 08:00
    const guess = to24(start, end.meridiem);
    s = guess <= to24(end, end.meridiem) ? guess : to24(start, "am");
  } else {
    s = to24(start, start.hour < 6 ? "pm" : "am");
    if (start.hour === 12) s = 12 * 60 + start.minute;
  }
  if (end.meridiem || is24(end)) {
    e = to24(end, end.meridiem);
  } else {
    e = to24(end, "am");
    // "8 to 8" → 08:00–20:00: an end at or before the start is read as pm.
    if (e <= s && end.hour < 12) e += 12 * 60;
  }
  return [s % 1440, e % 1440];
}

const fmt = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

function readBreak(text: string): number | null {
  if (/\b(no|without|never|sin|nunca)\b[^.;,]{0,20}\b(breaks?|lunch|meal|descansos?|comida|almuerzo)\b/.test(text))
    return 0;
  if (/\b(no breaks?|sin descanso)\b/.test(text)) return 0;
  const minutes = /(\d{1,3})\s*(?:-\s*)?(?:min|mins|minute|minutes|minutos)\b[^.;,]{0,12}\b(breaks?|lunch|meal|descanso|comida|almuerzo)?/.exec(
    text,
  );
  if (minutes && /(break|lunch|meal|descanso|comida|almuerzo)/.test(text)) return Number(minutes[1]);
  if (/\b(half an hour|half-hour|media hora)\b/.test(text)) return 30;
  if (/\b(an hour|1 hour|one hour|una hora)\b[^.;,]{0,12}\b(break|lunch|descanso|comida|almuerzo)\b/.test(text)) return 60;
  return null;
}

/** Days mentioned in a clause, in order, with ranges expanded. */
function readDays(clause: string): Weekday[] {
  for (const [re, set] of GROUPS) if (re.test(clause)) return set;
  const words = clause
    .replace(/[,/&]+/g, " , ")
    .replace(/(\p{L})\s*(-|–|—)\s*(\p{L})/gu, "$1 - $3")
    .split(/\s+/)
    .filter(Boolean);
  const out: Weekday[] = [];
  for (let i = 0; i < words.length; i++) {
    const day = dayOf(words[i].replace(/[.:]$/, ""));
    if (day === null) continue;
    const joiner = words[i + 1];
    const next = words[i + 2] ? dayOf(words[i + 2].replace(/[.:]$/, "")) : null;
    if (joiner && RANGE_JOINERS.test(joiner) && next !== null) {
      out.push(...expandRange(day, next));
      i += 2;
    } else {
      out.push(day);
    }
  }
  return [...new Set(out)];
}

export function parseWeekDescription(input: string): ParsedWeek {
  const text = input
    .toLowerCase()
    .normalize("NFC")
    .replace(/[–—]/g, "-");
  const breakMinutes = readBreak(text);
  const byDay = new Map<Weekday, Shift[]>();

  // Each time range applies to the days mentioned since the previous range.
  // A range with no days of its own is a second shift on the same days
  // ("Mon–Fri 8am–12pm and 5pm–9pm"); a range that names days replaces what
  // those days had ("Mon–Sat 8–8, Saturday 10–4").
  let cursor = 0;
  let lastDays: Weekday[] = [];
  for (const match of text.matchAll(TIME_RANGE_RE)) {
    const start = readClock(match[1]);
    const end = readClock(match[2]);
    if (!start || !end) continue;
    const before = text.slice(cursor, match.index);
    cursor = (match.index ?? 0) + match[0].length;
    let days = readDays(before);
    if (days.length === 0 && lastDays.length === 0) {
      // Days may follow the time: "8am-8pm Monday through Saturday".
      const after = text.slice(cursor).split(/[;\n.]|\d{1,2}(?::\d{2})?\s*(?:am|pm)/)[0];
      days = readDays(after);
    }
    const splitShift = days.length === 0;
    if (splitShift) days = lastDays;
    if (days.length === 0) continue;
    lastDays = days;
    const [s, e] = resolveRange(start, end);
    for (const day of days) {
      // The stated meal break belongs to the day, so it is taken from the first shift only.
      const shift: Shift = { day, start: fmt(s), end: fmt(e), breakMinutes: 0 };
      const existing = splitShift ? (byDay.get(day) ?? []) : [];
      if (existing.length === 0) shift.breakMinutes = breakMinutes ?? 0;
      byDay.set(day, [...existing, shift]);
    }
  }

  const shifts = [...byDay.values()]
    .flat()
    .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
  return { shifts, breakMinutes, understood: shifts.length > 0 };
}
