export type OtRule = "federal" | "daily_weekly" | "california";

export type PeriodKind = "one_week" | "two_weeks";

export type DaySplit = {
  hours: number;
  reg: number;
  ot: number;
  dt: number;
  isSeventhDay: boolean;
};

export type WeekMoney = {
  days: DaySplit[];
  reg: number;
  ot: number;
  dt: number;
  total: number;
  regularPay: number;
  overtimePay: number;
  doubleTimePay: number;
  bonus: number;
  bonusOT: number;
  gross: number;
  /** Shown only when bonus > 0. */
  regularRate: number | null;
  extraHalf: number;
  avgPerHour: number | null;
};

export type WeekInput = {
  rule: OtRule;
  /** 7 hours in workweek order (index 0 = workweek start day). */
  hours: number[];
  rate: number;
  /** Overtime multiplier (default 1.5). */
  m1: number;
  /** Double-time multiplier (default 2). */
  m2: number;
  bonus: number;
  /** Daily OT threshold for daily_weekly (default 8). */
  dailyLimit?: number;
  /** Double-time after this many hours in a day; null/undefined = off. */
  doubleTimeAfter?: number | null;
};

export type ComputeError = "day_over_24";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
