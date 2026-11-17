import { roundPunch } from "./rounding";
import type { BreakEntry, ClockFormat, DayRow, DayStatus, RoundingMode, TimePunch } from "./types";

const DAY = 24 * 60;

export function clampPunchMinutes(m: number): number {
  return ((Math.round(m) % DAY) + DAY) % DAY;
}

/** Elapsed clock minutes; adds 24h when end is earlier than start (overnight). */
export function elapsedMinutes(start: number, end: number): {
  minutes: number;
  overnight: boolean;
  equal: boolean;
} {
  const s = clampPunchMinutes(start);
  const e = clampPunchMinutes(end);
  if (s === e) return { minutes: 0, overnight: false, equal: true };
  if (e < s) return { minutes: e + DAY - s, overnight: true, equal: false };
  return { minutes: e - s, overnight: false, equal: false };
}

export function breakMinutes(
  entry: BreakEntry,
  rounding: RoundingMode,
): { minutes: number; error?: string } {
  if (entry.mode === "duration") {
    const d = entry.durationMinutes;
    if (d == null || d <= 0) return { minutes: 0 };
    return { minutes: Math.round(d) };
  }
  if (entry.start.minutes == null || entry.end.minutes == null) {
    if (entry.start.minutes != null || entry.end.minutes != null) {
      return { minutes: 0, error: "Add both break start and end times." };
    }
    return { minutes: 0 };
  }
  const rs = roundPunch(entry.start.minutes, rounding);
  const re = roundPunch(entry.end.minutes, rounding);
  const { minutes, equal } = elapsedMinutes(rs, re);
  if (equal) return { minutes: 0 };
  return { minutes };
}

export function evaluateDay(row: DayRow, rounding: RoundingMode): DayStatus {
  const hasStart = row.start.minutes != null;
  const hasEnd = row.end.minutes != null;
  if (!hasStart && !hasEnd) {
    const hasBreakContent = row.breaks.some(
      (b) =>
        (b.mode === "duration" && b.durationMinutes != null && b.durationMinutes > 0) ||
        b.start.minutes != null ||
        b.end.minutes != null,
    );
    if (hasBreakContent) {
      return { kind: "incomplete", message: "Add a start and end time." };
    }
    return { kind: "empty" };
  }
  if (hasStart && !hasEnd) {
    return { kind: "incomplete", message: "Add an end time." };
  }
  if (!hasStart && hasEnd) {
    return { kind: "incomplete", message: "Add a start time." };
  }

  const rawStart = row.start.minutes!;
  const rawEnd = row.end.minutes!;
  const roundedStart = roundPunch(rawStart, rounding);
  const roundedEnd = roundPunch(rawEnd, rounding);
  const { minutes: elapsed, overnight, equal } = elapsedMinutes(roundedStart, roundedEnd);

  let unpaid = 0;
  for (const b of row.breaks) {
    const br = breakMinutes(b, rounding);
    if (br.error) return { kind: "invalid", message: br.error };
    unpaid += br.minutes;
  }

  const net = elapsed - unpaid;
  if (net < 0) {
    return {
      kind: "invalid",
      message: "Breaks are longer than the shift. Shorten a break or fix the times.",
    };
  }

  return {
    kind: "ok",
    overnight,
    equalTimes: equal,
    elapsedMinutes: elapsed,
    breakMinutes: unpaid,
    netMinutes: net,
    roundedStart,
    roundedEnd,
    startRoundedFrom: rounding !== "off" && roundedStart !== clampPunchMinutes(rawStart) ? rawStart : null,
    endRoundedFrom: rounding !== "off" && roundedEnd !== clampPunchMinutes(rawEnd) ? rawEnd : null,
  };
}

/** Convert 12h UI fields → minutes from midnight. hour 1–12, minute 0–59. */
export function from12h(hour12: number, minute: number, isPm: boolean): number {
  let h = hour12 % 12;
  if (isPm) h += 12;
  // 12 AM → 0; 12 PM → 12
  if (hour12 === 12) h = isPm ? 12 : 0;
  return clampPunchMinutes(h * 60 + minute);
}

export function to12h(minutes: number): { hour12: number; minute: number; isPm: boolean } {
  const m = clampPunchMinutes(minutes);
  const hour24 = Math.floor(m / 60);
  const minute = m % 60;
  const isPm = hour24 >= 12;
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, isPm };
}

export function from24h(hour24: number, minute: number): number {
  return clampPunchMinutes(hour24 * 60 + minute);
}

export function to24h(minutes: number): { hour24: number; minute: number } {
  const m = clampPunchMinutes(minutes);
  return { hour24: Math.floor(m / 60), minute: m % 60 };
}

export function formatPunch(minutes: number, format: ClockFormat): string {
  if (format === "24h") {
    const { hour24, minute } = to24h(minutes);
    return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  const { hour12, minute, isPm } = to12h(minutes);
  return `${hour12}:${String(minute).padStart(2, "0")} ${isPm ? "PM" : "AM"}`;
}

export function emptyPunch(): TimePunch {
  return { minutes: null };
}

export function emptyBreak(id: string, label = "Lunch"): BreakEntry {
  return {
    id,
    label,
    mode: "duration",
    durationMinutes: null,
    start: emptyPunch(),
    end: emptyPunch(),
  };
}

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function weekdayLabel(weekStart: number, dayIndex: number): string {
  const dow = (weekStart + dayIndex) % 7;
  return WEEKDAY_NAMES[dow]!;
}
