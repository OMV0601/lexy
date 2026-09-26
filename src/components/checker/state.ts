import type { PayInput, Shift, WeekInput } from "@/lib/wage/engine";
import type { JurisdictionId } from "@/lib/wage/law";

export type Step = 0 | 1 | 2 | 3 | 4;

/** A shift as the calendar holds it; the meal break is set once for the week. */
export type DraftShift = Omit<Shift, "breakMinutes">;

export type CheckerState = {
  step: Step;
  jurisdiction: JurisdictionId | null;
  shifts: DraftShift[];
  breakMinutes: 0 | 30 | 60;
  restBreaks: boolean | null;
  payKind: "flat" | "hourly";
  amount: string;
  rate: string;
  received: string;
  workerName: string;
  employerName: string;
};

export const initialState: CheckerState = {
  step: 0,
  jurisdiction: null,
  shifts: [],
  breakMinutes: 0,
  restBreaks: null,
  payKind: "flat",
  amount: "",
  rate: "",
  received: "",
  workerName: "",
  employerName: "",
};

/** Rosa: dishwasher in Los Angeles, six 12-hour days, $700 cash. */
export const demoState: CheckerState = {
  ...initialState,
  step: 3,
  jurisdiction: "los-angeles",
  shifts: [0, 1, 2, 3, 4, 5].map((day) => ({ day: day as DraftShift["day"], start: "08:00", end: "20:00" })),
  breakMinutes: 0,
  restBreaks: false,
  payKind: "flat",
  amount: "700",
  workerName: "Rosa M.",
  employerName: "",
};

export type Action =
  | { type: "go"; step: Step }
  | { type: "setJurisdiction"; id: JurisdictionId }
  | { type: "setShifts"; shifts: DraftShift[]; breakMinutes?: number | null }
  | { type: "upsertShift"; shift: DraftShift }
  | { type: "removeShift"; day: DraftShift["day"] }
  | { type: "setBreak"; minutes: 0 | 30 | 60 }
  | { type: "setRest"; value: boolean }
  | { type: "setPayKind"; kind: "flat" | "hourly" }
  | { type: "setField"; field: "amount" | "rate" | "received" | "workerName" | "employerName"; value: string }
  | { type: "load"; state: CheckerState }
  | { type: "reset" };

const normalizeBreak = (minutes: number): 0 | 30 | 60 => (minutes >= 45 ? 60 : minutes >= 15 ? 30 : 0);

export function reducer(state: CheckerState, action: Action): CheckerState {
  switch (action.type) {
    case "go":
      return { ...state, step: action.step };
    case "setJurisdiction":
      return { ...state, jurisdiction: action.id };
    case "setShifts":
      return {
        ...state,
        shifts: [...action.shifts].sort((a, b) => a.day - b.day),
        breakMinutes: action.breakMinutes == null ? state.breakMinutes : normalizeBreak(action.breakMinutes),
      };
    case "upsertShift":
      return {
        ...state,
        shifts: [...state.shifts.filter((s) => s.day !== action.shift.day), action.shift].sort((a, b) => a.day - b.day),
      };
    case "removeShift":
      return { ...state, shifts: state.shifts.filter((s) => s.day !== action.day) };
    case "setBreak":
      return { ...state, breakMinutes: action.minutes };
    case "setRest":
      return { ...state, restBreaks: action.value };
    case "setPayKind":
      return { ...state, payKind: action.kind };
    case "setField":
      return { ...state, [action.field]: action.value };
    case "load":
      return action.state;
    case "reset":
      return initialState;
  }
}

export const parseMoney = (value: string) => {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export function payInput(state: CheckerState): PayInput | null {
  if (state.payKind === "flat") {
    const amount = parseMoney(state.amount);
    return amount > 0 ? { kind: "flat", amount } : null;
  }
  const rate = parseMoney(state.rate);
  if (rate <= 0) return null;
  const received = state.received.trim() ? parseMoney(state.received) : undefined;
  return { kind: "hourly", rate, amountReceived: received };
}

export function weekInput(state: CheckerState): WeekInput | null {
  const pay = payInput(state);
  if (!state.jurisdiction || state.shifts.length === 0 || !pay) return null;
  return {
    jurisdiction: state.jurisdiction,
    shifts: state.shifts.map((s) => ({ ...s, breakMinutes: state.breakMinutes })),
    pay,
    restBreaksProvided: state.restBreaks !== false,
  };
}
