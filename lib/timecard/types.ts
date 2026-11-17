/** Pure types for the time card calculator (no React). */

export type PeriodType = "week" | "biweekly";
export type ClockFormat = "12h" | "24h";
export type RoundingMode = "off" | "5" | "6" | "15";
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday … 6=Saturday

export type BreakMode = "duration" | "range";

export type TimePunch = {
  /** Minutes from midnight, 0–1439. Null = empty. */
  minutes: number | null;
};

export type BreakEntry = {
  id: string;
  label: string;
  mode: BreakMode;
  /** Used when mode === "duration". */
  durationMinutes: number | null;
  start: TimePunch;
  end: TimePunch;
};

export type DayRow = {
  id: string;
  /** Optional ISO date YYYY-MM-DD for display/CSV. */
  date: string | null;
  start: TimePunch;
  end: TimePunch;
  breaks: BreakEntry[];
  note: string;
};

export type TimeCardSettings = {
  period: PeriodType;
  weekStart: WeekStartDay;
  clockFormat: ClockFormat;
  rounding: RoundingMode;
  weeklyOvertime: boolean;
  dailyOvertime: boolean;
  /** Null/blank = no pay figures. */
  hourlyRate: number | null;
};

export type DayStatus =
  | { kind: "empty" }
  | { kind: "incomplete"; message: string }
  | { kind: "invalid"; message: string }
  | {
      kind: "ok";
      overnight: boolean;
      equalTimes: boolean;
      elapsedMinutes: number;
      breakMinutes: number;
      netMinutes: number;
      /** After rounding applied to punches (and range breaks). */
      roundedStart: number;
      roundedEnd: number;
      startRoundedFrom: number | null;
      endRoundedFrom: number | null;
    };

export type DayTotals = {
  status: DayStatus;
  netMinutes: number;
  netDecimal: number;
  regularMinutes: number;
  overtimeMinutes: number;
  dailyOvertimeMinutes: number;
};

export type WeekTotals = {
  totalMinutes: number;
  totalDecimal: number;
  regularMinutes: number;
  overtimeMinutes: number;
  dailyOvertimeMinutes: number;
  weeklyOvertimeMinutes: number;
  regularDecimal: number;
  overtimeDecimal: number;
};

export type PeriodTotals = {
  weeks: WeekTotals[];
  period: WeekTotals;
  regularPay: number | null;
  overtimePay: number | null;
  grossPay: number | null;
};

export type TimeCardState = {
  settings: TimeCardSettings;
  days: DayRow[];
};

export const STORAGE_KEY = "exestools.timecard.v1";
export const MAX_BREAKS_PER_DAY = 6;
export const WEEKLY_OT_THRESHOLD_HOURS = 40;
export const DAILY_OT_THRESHOLD_HOURS = 8;
