import { defaultSettings, defaultState, makeDayRow, resizeDaysForPeriod } from "./defaults";
import { emptyBreak, emptyPunch } from "./time";
import type { BreakEntry, DayRow, TimeCardSettings, TimeCardState } from "./types";
import { STORAGE_KEY } from "./types";

export { STORAGE_KEY };

export type LoadResult =
  | { ok: true; state: TimeCardState }
  | { ok: false; reason: "unavailable" | "empty" | "corrupt" };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parsePunch(v: unknown): { minutes: number | null } {
  if (!isObj(v)) return emptyPunch();
  const m = v.minutes;
  if (m == null) return emptyPunch();
  if (typeof m === "number" && Number.isFinite(m)) return { minutes: Math.round(m) };
  return emptyPunch();
}

function parseBreak(v: unknown, i: number): BreakEntry {
  if (!isObj(v)) return emptyBreak(`brk-${i}`, "Lunch");
  const mode = v.mode === "range" ? "range" : "duration";
  return {
    id: typeof v.id === "string" ? v.id : `brk-${i}`,
    label: typeof v.label === "string" ? v.label : "Break",
    mode,
    durationMinutes:
      typeof v.durationMinutes === "number" && Number.isFinite(v.durationMinutes)
        ? Math.round(v.durationMinutes)
        : null,
    start: parsePunch(v.start),
    end: parsePunch(v.end),
  };
}

function parseDay(v: unknown, i: number): DayRow {
  if (!isObj(v)) return makeDayRow();
  const breaksRaw = Array.isArray(v.breaks) ? v.breaks : [];
  const breaks = breaksRaw.slice(0, 6).map((b, j) => parseBreak(b, j));
  if (breaks.length === 0) breaks.push(emptyBreak(`brk-${i}-0`, "Lunch"));
  return {
    id: typeof v.id === "string" ? v.id : `day-${i}`,
    date: typeof v.date === "string" ? v.date : null,
    start: parsePunch(v.start),
    end: parsePunch(v.end),
    breaks,
    note: typeof v.note === "string" ? v.note.slice(0, 120) : "",
  };
}

function parseSettings(v: unknown): TimeCardSettings {
  const d = defaultSettings();
  if (!isObj(v)) return d;
  const period = v.period === "biweekly" ? "biweekly" : "week";
  const weekStart =
    typeof v.weekStart === "number" && v.weekStart >= 0 && v.weekStart <= 6
      ? (v.weekStart as TimeCardSettings["weekStart"])
      : d.weekStart;
  const clockFormat = v.clockFormat === "24h" ? "24h" : "12h";
  const rounding =
    v.rounding === "5" || v.rounding === "6" || v.rounding === "15" ? v.rounding : "off";
  const hourlyRate =
    typeof v.hourlyRate === "number" && Number.isFinite(v.hourlyRate) && v.hourlyRate >= 0
      ? v.hourlyRate
      : null;
  return {
    period,
    weekStart,
    clockFormat,
    rounding,
    weeklyOvertime: v.weeklyOvertime !== false,
    dailyOvertime: v.dailyOvertime === true,
    hourlyRate,
  };
}

export function parseStoredState(raw: string): LoadResult {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!isObj(data)) return { ok: false, reason: "corrupt" };
    const settings = parseSettings(data.settings);
    const daysRaw = Array.isArray(data.days) ? data.days : [];
    let days = daysRaw.map((d, i) => parseDay(d, i));
    days = resizeDaysForPeriod(days, settings.period);
    return { ok: true, state: { settings, days } };
  } catch {
    return { ok: false, reason: "corrupt" };
  }
}

export function loadTimeCard(): LoadResult {
  if (typeof window === "undefined") return { ok: false, reason: "unavailable" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ok: false, reason: "empty" };
    return parseStoredState(raw);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export function saveTimeCard(state: TimeCardState): { ok: boolean; unavailable?: boolean } {
  if (typeof window === "undefined") return { ok: false, unavailable: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return { ok: false, unavailable: true };
  }
}

export function clearTimeCardStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function freshState(): TimeCardState {
  return defaultState();
}
