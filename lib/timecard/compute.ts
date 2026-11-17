import { minutesToDecimal } from "./decimal";
import { combineWeeks, computeGrossPay, splitWeekOvertime } from "./overtime";
import { evaluateDay } from "./time";
import type {
  DayRow,
  DayTotals,
  PeriodTotals,
  TimeCardSettings,
  WeekTotals,
} from "./types";

export function dayTotals(row: DayRow, settings: TimeCardSettings): DayTotals {
  const status = evaluateDay(row, settings.rounding);
  if (status.kind !== "ok") {
    return {
      status,
      netMinutes: 0,
      netDecimal: 0,
      regularMinutes: 0,
      overtimeMinutes: 0,
      dailyOvertimeMinutes: 0,
    };
  }
  const net = status.netMinutes;
  // Per-day OT labels for display (weekly OT is applied at week level)
  let dailyOT = 0;
  if (settings.dailyOvertime) {
    dailyOT = Math.max(0, net - 8 * 60);
  }
  return {
    status,
    netMinutes: net,
    netDecimal: minutesToDecimal(net),
    regularMinutes: net - dailyOT,
    overtimeMinutes: dailyOT,
    dailyOvertimeMinutes: dailyOT,
  };
}

export function computePeriod(days: DayRow[], settings: TimeCardSettings): PeriodTotals {
  const weekLen = 7;
  const weekCount = settings.period === "biweekly" ? 2 : 1;
  const weeks: WeekTotals[] = [];

  for (let w = 0; w < weekCount; w++) {
    const slice = days.slice(w * weekLen, w * weekLen + weekLen);
    const nets = slice.map((d) => {
      const t = dayTotals(d, settings);
      return t.status.kind === "ok" ? t.netMinutes : 0;
    });
    weeks.push(
      splitWeekOvertime(nets, {
        weekly: settings.weeklyOvertime,
        daily: settings.dailyOvertime,
      }),
    );
  }

  const period = combineWeeks(weeks);
  const pay = computeGrossPay(period.regularMinutes, period.overtimeMinutes, settings.hourlyRate);
  return { weeks, period, ...pay };
}
