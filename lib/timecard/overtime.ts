import { minutesToDecimal } from "./decimal";
import type { WeekTotals } from "./types";

const WEEKLY_OT_MIN = 40 * 60;
const DAILY_OT_MIN = 8 * 60;

/**
 * Split net minutes in one workweek into regular / overtime.
 * When daily OT is on: daily OT first, then weekly OT on remaining regular hours.
 */
export function splitWeekOvertime(
  dayNetMinutes: number[],
  opts: { weekly: boolean; daily: boolean },
): WeekTotals {
  const valid = dayNetMinutes.map((m) => Math.max(0, Math.round(m)));
  const totalMinutes = valid.reduce((a, b) => a + b, 0);

  if (!opts.weekly && !opts.daily) {
    return pack(totalMinutes, totalMinutes, 0, 0, 0);
  }

  if (opts.daily && opts.weekly) {
    let dailyOT = 0;
    let dailyRegularSum = 0;
    for (const net of valid) {
      const dOT = Math.max(0, net - DAILY_OT_MIN);
      dailyOT += dOT;
      dailyRegularSum += net - dOT;
    }
    const weeklyOT = Math.max(0, dailyRegularSum - WEEKLY_OT_MIN);
    const regular = dailyRegularSum - weeklyOT;
    const overtime = dailyOT + weeklyOT;
    return pack(totalMinutes, regular, overtime, dailyOT, weeklyOT);
  }

  if (opts.daily) {
    let dailyOT = 0;
    let regular = 0;
    for (const net of valid) {
      const dOT = Math.max(0, net - DAILY_OT_MIN);
      dailyOT += dOT;
      regular += net - dOT;
    }
    return pack(totalMinutes, regular, dailyOT, dailyOT, 0);
  }

  // weekly only
  const overtime = Math.max(0, totalMinutes - WEEKLY_OT_MIN);
  const regular = totalMinutes - overtime;
  return pack(totalMinutes, regular, overtime, 0, overtime);
}

function pack(
  totalMinutes: number,
  regularMinutes: number,
  overtimeMinutes: number,
  dailyOvertimeMinutes: number,
  weeklyOvertimeMinutes: number,
): WeekTotals {
  return {
    totalMinutes,
    totalDecimal: minutesToDecimal(totalMinutes),
    regularMinutes,
    overtimeMinutes,
    dailyOvertimeMinutes,
    weeklyOvertimeMinutes,
    regularDecimal: minutesToDecimal(regularMinutes),
    overtimeDecimal: minutesToDecimal(overtimeMinutes),
  };
}

export function combineWeeks(weeks: WeekTotals[]): WeekTotals {
  const sum = (pick: (w: WeekTotals) => number) => weeks.reduce((a, w) => a + pick(w), 0);
  const totalMinutes = sum((w) => w.totalMinutes);
  const regularMinutes = sum((w) => w.regularMinutes);
  const overtimeMinutes = sum((w) => w.overtimeMinutes);
  const dailyOvertimeMinutes = sum((w) => w.dailyOvertimeMinutes);
  const weeklyOvertimeMinutes = sum((w) => w.weeklyOvertimeMinutes);
  return {
    totalMinutes,
    totalDecimal: minutesToDecimal(totalMinutes),
    regularMinutes,
    overtimeMinutes,
    dailyOvertimeMinutes,
    weeklyOvertimeMinutes,
    regularDecimal: minutesToDecimal(regularMinutes),
    overtimeDecimal: minutesToDecimal(overtimeMinutes),
  };
}

export function computeGrossPay(
  regularMinutes: number,
  overtimeMinutes: number,
  hourlyRate: number | null,
): { regularPay: number | null; overtimePay: number | null; grossPay: number | null } {
  if (hourlyRate == null || !Number.isFinite(hourlyRate) || hourlyRate < 0) {
    return { regularPay: null, overtimePay: null, grossPay: null };
  }
  const regularHours = minutesToDecimal(regularMinutes);
  const overtimeHours = minutesToDecimal(overtimeMinutes);
  const regularPay = roundMoney(regularHours * hourlyRate);
  const overtimePay = roundMoney(overtimeHours * hourlyRate * 1.5);
  return {
    regularPay,
    overtimePay,
    grossPay: roundMoney(regularPay + overtimePay),
  };
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
