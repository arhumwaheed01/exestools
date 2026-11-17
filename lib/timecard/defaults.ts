import { emptyBreak, emptyPunch } from "./time";
import type { DayRow, PeriodType, TimeCardSettings, TimeCardState, WeekStartDay } from "./types";

let idSeq = 0;
export function newId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`;
}

export function defaultSettings(): TimeCardSettings {
  return {
    period: "week",
    weekStart: 1, // Monday
    clockFormat: "12h",
    rounding: "off",
    weeklyOvertime: true,
    dailyOvertime: false,
    hourlyRate: null,
  };
}

export function makeDayRow(): DayRow {
  return {
    id: newId("day"),
    date: null,
    start: emptyPunch(),
    end: emptyPunch(),
    breaks: [emptyBreak(newId("brk"), "Lunch")],
    note: "",
  };
}

export function makeDays(period: PeriodType): DayRow[] {
  const n = period === "biweekly" ? 14 : 7;
  return Array.from({ length: n }, () => makeDayRow());
}

export function defaultState(): TimeCardState {
  const settings = defaultSettings();
  return { settings, days: makeDays(settings.period) };
}

export function resizeDaysForPeriod(days: DayRow[], period: PeriodType): DayRow[] {
  const n = period === "biweekly" ? 14 : 7;
  if (days.length === n) return days;
  if (days.length > n) return days.slice(0, n);
  return [...days, ...Array.from({ length: n - days.length }, () => makeDayRow())];
}

export function weekStartLabel(day: WeekStartDay): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]!;
}
